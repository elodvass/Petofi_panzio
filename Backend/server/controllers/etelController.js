const etelService = require('../services/etelService');

async function getAll(req, res, next) {
    try {
        const etelek = await etelService.getAllMenuItems();
        res.json(etelek);
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Nem sikerült lekérni az ételeket.';
        }
        next(error);
    }
}

async function getDailyMenu(req, res, next) {
    try {
        const { datum, erkezes, tavozas } = req.query;

        if (erkezes && tavozas) {
            const napok = await etelService.getDailyMenusForRange(erkezes, tavozas);
            return res.json({
                erkezes,
                tavozas,
                max_adag_kategoriankent: etelService.MAX_ADAG_KATEGORIANKENT,
                napok
            });
        }

        const napiMenu = await etelService.getDailyMenu(datum);
        return res.json(napiMenu);
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Nem sikerült lekérni a napi menüt.';
        }
        next(error);
    }
}

module.exports = {
    getAll,
    getDailyMenu
};
