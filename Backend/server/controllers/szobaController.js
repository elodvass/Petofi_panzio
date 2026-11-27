const szobaService = require('../services/szobaService');

async function getAll(req, res, next) {
    try {
        const szobak = await szobaService.getAllRooms();
        res.json(szobak);
    } catch (error) {
        error.publicMessage = 'Nem sikerült lekérni a szobákat.';
        next(error);
    }
}

module.exports = {
    getAll
};
