const szobaRepository = require('../repositories/szobaRepository');

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

async function getAllRooms({ erkezes, tavozas, csak_szabad } = {}) {
    const rooms = await szobaRepository.findAllWithFelszerelesek();
    const plainRooms = rooms.map((room) => room.toJSON());

    if (!erkezes && !tavozas) {
        return plainRooms;
    }

    if (!erkezes || !tavozas) {
        throw createServiceError('A dátum szerinti szűréshez az érkezés és távozás dátumát együtt add meg!', 400);
    }

    if (!isValidISODate(erkezes) || !isValidISODate(tavozas)) {
        throw createServiceError('Érvénytelen dátumformátum! Használj ÉÉÉÉ-HH-NN formátumot.', 400);
    }

    if (erkezes >= tavozas) {
        throw createServiceError('A távozás dátumának későbbre kell esnie az érkezés dátumánál!', 400);
    }

    const bookedRoomIds = await szobaRepository.findBookedRoomIdsInRange(erkezes, tavozas);
    const roomsWithAvailability = plainRooms.map((room) => ({
        ...room,
        szabad_a_datumra: !bookedRoomIds.has(room.id)
    }));

    if (csak_szabad === 'true' || csak_szabad === '1' || csak_szabad === true) {
        return roomsWithAvailability.filter((room) => room.szabad_a_datumra);
    }

    return roomsWithAvailability;
}

module.exports = {
    getAllRooms
};
