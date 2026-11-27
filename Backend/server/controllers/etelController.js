const etelService = require('../services/etelService');

async function getAll(req, res, next) {
    try {
        const etelek = await etelService.getAllMenuItems();
        res.json(etelek);
    } catch (error) {
        error.publicMessage = 'Nem sikerült lekérni az ételeket.';
        next(error);
    }
}

module.exports = {
    getAll
};
