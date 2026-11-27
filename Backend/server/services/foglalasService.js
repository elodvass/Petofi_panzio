const felhasznaloRepository = require('../repositories/felhasznaloRepository');
const szobaRepository = require('../repositories/szobaRepository');
const foglalasRepository = require('../repositories/foglalasRepository');
const etelService = require('./etelService');

const MAX_ADAG_KATEGORIANKENT = etelService.MAX_ADAG_KATEGORIANKENT;
const ENGEDELYEZETT_STATUSZOK = ['fuggoben', 'megerositve', 'lemondva'];

const KATEGORIA_CIMKE = {
    reggeli: 'reggeli',
    ebed: 'ebéd',
    vacsora: 'vacsora'
};

function createServiceError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function isValidISODate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const dt = new Date(Date.UTC(year, month - 1, day));
    return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}

async function getBookings({ felhasznalo_id } = {}) {
    let parsedUserId;
    if (felhasznalo_id !== undefined && felhasznalo_id !== '') {
        parsedUserId = Number(felhasznalo_id);
        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
            throw createServiceError('Érvénytelen felhasznalo_id paraméter!', 400);
        }
    }

    return foglalasRepository.findAllDetailed({ felhasznalo_id: parsedUserId });
}

async function getBookingById(id) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw createServiceError('Érvénytelen foglalás azonosító!', 400);
    }

    const booking = await foglalasRepository.findByIdDetailed(parsedId);
    if (!booking) {
        throw createServiceError('A keresett foglalás nem található!', 404);
    }

    return booking;
}

async function createBooking({
    felhasznalo_id,
    szoba_id,
    erkezes_datum,
    tavozas_datum,
    vendegek_szama,
    etkezesek = []
}) {
    if (!isValidISODate(erkezes_datum) || !isValidISODate(tavozas_datum)) {
        throw createServiceError('Érvénytelen dátumformátum! Használj ÉÉÉÉ-HH-NN formátumot.', 400);
    }

    if (erkezes_datum >= tavozas_datum) {
        throw createServiceError('A távozás dátumának későbbre kell esnie az érkezés dátumánál!', 400);
    }

    const [user, room] = await Promise.all([
        felhasznaloRepository.findById(felhasznalo_id),
        szobaRepository.findByIdWithFelszerelesek(szoba_id)
    ]);

    if (!user) {
        throw createServiceError('A megadott felhasználó nem található!', 404);
    }

    if (!room) {
        throw createServiceError('A megadott szoba nem található!', 404);
    }

    if (vendegek_szama < 1 || vendegek_szama > room.ferohely) {
        throw createServiceError(
            `A(z) ${room.szobaszam}. szoba férőhelye legfeljebb ${room.ferohely} fő!`,
            400
        );
    }

    const overlapping = await foglalasRepository.findOverlappingBooking({
        szoba_id,
        erkezes_datum,
        tavozas_datum
    });
    if (overlapping) {
        throw createServiceError('Ez a szoba a megadott időszakban már foglalt!', 409);
    }

    // Étkezések ellenőrzése: napi menü (fix reggeli, A/B ebéd, fix vacsora) + max 5 adag / kategória / nap
    const mergedMealsMap = new Map();

    if (Array.isArray(etkezesek) && etkezesek.length > 0) {
        const dailyMenus = await etelService.getDailyMenusForRange(erkezes_datum, tavozas_datum);
        const allowedByDate = new Map();

        for (const dayMenu of dailyMenus) {
            const allowedDishes = new Map();
            if (dayMenu.reggeli) allowedDishes.set(dayMenu.reggeli.id, dayMenu.reggeli);
            for (const ebedOption of dayMenu.ebed || []) {
                allowedDishes.set(ebedOption.id, ebedOption);
            }
            if (dayMenu.vacsora) allowedDishes.set(dayMenu.vacsora.id, dayMenu.vacsora);
            allowedByDate.set(dayMenu.datum, allowedDishes);
        }

        const categoryTotals = new Map();

        for (const item of etkezesek) {
            const datum = item.datum;
            const etelId = Number(item.etel_id);
            const adag = Number(item.adag);

            if (!isValidISODate(datum)) {
                throw createServiceError(`Érvénytelen étkezési dátum: ${datum}`, 400);
            }

            if (datum < erkezes_datum || datum > tavozas_datum) {
                throw createServiceError(
                    `A(z) ${datum} étkezési dátum kívül esik a foglalás időszakán (${erkezes_datum} – ${tavozas_datum})!`,
                    400
                );
            }

            if (!Number.isInteger(adag) || adag < 1 || adag > MAX_ADAG_KATEGORIANKENT) {
                throw createServiceError(
                    `Egy ételből alkalmanként 1 és ${MAX_ADAG_KATEGORIANKENT} közötti adag rendelhető!`,
                    400
                );
            }

            const allowedDishes = allowedByDate.get(datum);
            const matchedDish = allowedDishes ? allowedDishes.get(etelId) : null;
            if (!matchedDish) {
                throw createServiceError(
                    `A kiválasztott étel (ID: ${etelId}) a(z) ${datum} napi menüben nem választható!`,
                    400
                );
            }

            const catKey = `${datum}|${matchedDish.kategoria}`;
            const nextCategoryTotal = (categoryTotals.get(catKey) || 0) + adag;
            if (nextCategoryTotal > MAX_ADAG_KATEGORIANKENT) {
                const label = KATEGORIA_CIMKE[matchedDish.kategoria] || matchedDish.kategoria;
                throw createServiceError(
                    `A(z) ${datum} napon ${label} kategóriából összesen legfeljebb ${MAX_ADAG_KATEGORIANKENT} adag kérhető!`,
                    400
                );
            }
            categoryTotals.set(catKey, nextCategoryTotal);

            const mealKey = `${datum}|${etelId}`;
            const existingMeal = mergedMealsMap.get(mealKey);
            if (existingMeal) {
                existingMeal.adag += adag;
            } else {
                mergedMealsMap.set(mealKey, {
                    datum,
                    etel_id: etelId,
                    adag
                });
            }
        }
    }

    const mealsData = Array.from(mergedMealsMap.values());

    return foglalasRepository.createBookingWithMeals({
        bookingData: {
            felhasznalo_id,
            szoba_id,
            erkezes_datum,
            tavozas_datum,
            vendegek_szama,
            statusz: 'fuggoben'
        },
        mealsData
    });
}

async function updateBookingStatus(id, statusz) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw createServiceError('Érvénytelen foglalás azonosító!', 400);
    }

    if (!ENGEDELYEZETT_STATUSZOK.includes(statusz)) {
        throw createServiceError(
            `Érvénytelen státusz! Megengedett értékek: ${ENGEDELYEZETT_STATUSZOK.join(', ')}.`,
            400
        );
    }

    const updated = await foglalasRepository.updateStatus(parsedId, statusz);
    if (!updated) {
        throw createServiceError('A keresett foglalás nem található!', 404);
    }

    return updated;
}

async function deleteBooking(id) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw createServiceError('Érvénytelen foglalás azonosító!', 400);
    }

    const deleted = await foglalasRepository.deleteById(parsedId);
    if (!deleted) {
        throw createServiceError('A keresett foglalás nem található!', 404);
    }
}

module.exports = {
    getBookings,
    getBookingById,
    createBooking,
    updateBookingStatus,
    deleteBooking
};
