const felszerelesService = require('../services/felszerelesService');

async function getAll(req, res, next) {
    try {
        const felszerelesek = await felszerelesService.getAllFelszerelesek();
        res.json(felszerelesek);
    } catch (error) {
        error.publicMessage = 'Nem sikerült lekérni a felszereléseket.';
        next(error);
    }
}

module.exports = {
    getAll
};
