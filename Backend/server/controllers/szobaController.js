const szobaService = require('../services/szobaService');

async function getAll(req, res, next) {
    try {
        const { erkezes, tavozas, csak_szabad } = req.query;
        const szobak = await szobaService.getAllRooms({ erkezes, tavozas, csak_szabad });
        res.json(szobak);
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Nem sikerült lekérni a szobákat.';
        }
        next(error);
    }
}

module.exports = {
    getAll
};
