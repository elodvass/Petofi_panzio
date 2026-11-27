const foglalasService = require('../services/foglalasService');

async function getAll(req, res, next) {
    try {
        const { felhasznalo_id } = req.query;
        const foglalasok = await foglalasService.getBookings({ felhasznalo_id });
        res.json(foglalasok);
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Nem sikerült lekérni a foglalásokat.';
        }
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const foglalas = await foglalasService.getBookingById(req.params.id);
        res.json(foglalas);
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Nem sikerült lekérni a foglalást.';
        }
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const foglalas = await foglalasService.createBooking(req.body);
        res.status(201).json({
            message: 'Sikeres szobafoglalás!',
            foglalas
        });
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Nem sikerült rögzíteni a foglalást.';
        }
        next(error);
    }
}

async function updateStatus(req, res, next) {
    try {
        const foglalas = await foglalasService.updateBookingStatus(req.params.id, req.body.statusz);
        res.json({
            message: 'A foglalás státusza frissítve.',
            foglalas
        });
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Nem sikerült frissíteni a foglalás státuszát.';
        }
        next(error);
    }
}

async function remove(req, res, next) {
    try {
        await foglalasService.deleteBooking(req.params.id);
        res.json({ message: 'A foglalás sikeresen törölve.' });
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Nem sikerült törölni a foglalást.';
        }
        next(error);
    }
}

module.exports = {
    getAll,
    getById,
    create,
    updateStatus,
    remove
};
