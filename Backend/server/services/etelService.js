const etelRepository = require('../repositories/etelRepository');

const MAX_ADAG_KATEGORIANKENT = 5;

const KATEGORIA_SORREND = {
    reggeli: 1,
    ebed: 2,
    vacsora: 3
};

const OPCIO_SORREND = {
    fix: 1,
    A: 2,
    B: 3
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

function getTodayISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function enumerateDatesInclusive(startDate, endDate) {
    const dates = [];
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const current = new Date(Date.UTC(sy, sm - 1, sd));
    const end = new Date(Date.UTC(ey, em - 1, ed));

    while (current <= end) {
        const y = current.getUTCFullYear();
        const m = String(current.getUTCMonth() + 1).padStart(2, '0');
        const d = String(current.getUTCDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return dates;
}

function buildDailyMenuResponse(datum, menuRows, fallbackFoods) {
    const plainFallback = fallbackFoods.map((f) => (typeof f.toJSON === 'function' ? f.toJSON() : f));

    const findSlot = (kategoria, opcio) => {
        const match = menuRows.find(
            (row) => row.kategoria === kategoria && row.opcio === opcio && row.etel
        );
        if (match) {
            return typeof match.etel.toJSON === 'function' ? match.etel.toJSON() : match.etel;
        }
        return plainFallback.find((food) => food.kategoria === kategoria && food.opcio === opcio) || null;
    };

    const reggeli = findSlot('reggeli', 'fix');
    const ebedA = findSlot('ebed', 'A');
    const ebedB = findSlot('ebed', 'B');
    const vacsora = findSlot('vacsora', 'fix');

    return {
        datum,
        max_adag_kategoriankent: MAX_ADAG_KATEGORIANKENT,
        reggeli,
        ebed: [ebedA, ebedB].filter(Boolean),
        vacsora
    };
}

async function getAllMenuItems() {
    const rows = await etelRepository.findAllOrderedById();

    return [...rows].sort((a, b) => {
        const rankA = KATEGORIA_SORREND[a.kategoria] ?? 4;
        const rankB = KATEGORIA_SORREND[b.kategoria] ?? 4;
        if (rankA !== rankB) return rankA - rankB;
        const optA = OPCIO_SORREND[a.opcio] ?? 4;
        const optB = OPCIO_SORREND[b.opcio] ?? 4;
        if (optA !== optB) return optA - optB;
        return a.id - b.id;
    });
}

async function getDailyMenu(datum) {
    const targetDate = datum || getTodayISO();
    if (!isValidISODate(targetDate)) {
        throw createServiceError('Érvénytelen dátumformátum! Használj ÉÉÉÉ-HH-NN formátumot.', 400);
    }

    const [menuRows, allFoods] = await Promise.all([
        etelRepository.findDailyMenusByDate(targetDate),
        etelRepository.findAllOrderedById()
    ]);

    return buildDailyMenuResponse(targetDate, menuRows, allFoods);
}

async function getDailyMenusForRange(erkezes, tavozas) {
    if (!isValidISODate(erkezes) || !isValidISODate(tavozas)) {
        throw createServiceError('Érvénytelen dátumformátum! Használj ÉÉÉÉ-HH-NN formátumot.', 400);
    }

    if (erkezes > tavozas) {
        throw createServiceError('A záró dátum nem lehet korábbi a kezdő dátumnál!', 400);
    }

    const dates = enumerateDatesInclusive(erkezes, tavozas);
    if (dates.length > 31) {
        throw createServiceError('Egyszerre legfeljebb 31 nap napi menüje kérhető le.', 400);
    }

    const [menuRows, allFoods] = await Promise.all([
        etelRepository.findDailyMenusByDateRange(erkezes, tavozas),
        etelRepository.findAllOrderedById()
    ]);

    const rowsByDate = new Map();
    for (const row of menuRows) {
        if (!rowsByDate.has(row.datum)) rowsByDate.set(row.datum, []);
        rowsByDate.get(row.datum).push(row);
    }

    return dates.map((d) => buildDailyMenuResponse(d, rowsByDate.get(d) || [], allFoods));
}

module.exports = {
    MAX_ADAG_KATEGORIANKENT,
    getAllMenuItems,
    getDailyMenu,
    getDailyMenusForRange
};
