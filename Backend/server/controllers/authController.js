const authService = require('../services/authService');

async function register(req, res, next) {
    try {
        const user = await authService.registerGuest(req.body);
        res.status(201).json({
            message: 'Sikeres regisztráció!',
            user
        });
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Hiba történt a regisztráció során.';
        }
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const user = await authService.loginUser(req.body);
        res.json({
            message: 'Sikeres bejelentkezés!',
            user
        });
    } catch (error) {
        if (!error.statusCode) {
            error.publicMessage = 'Hiba történt a bejelentkezés során.';
        }
        next(error);
    }
}

module.exports = {
    register,
    login
};
