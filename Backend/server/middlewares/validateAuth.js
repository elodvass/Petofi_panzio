function validateRegister(req, res, next) {
    const { nev, email, jelszo } = req.body || {};

    if (!nev || !email || !jelszo) {
        return res.status(400).json({ message: 'Minden mező kitöltése kötelező!' });
    }

    const trimmedName = String(nev).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!trimmedName || !normalizedEmail) {
        return res.status(400).json({ message: 'Minden mező kitöltése kötelező!' });
    }

    req.body.nev = trimmedName;
    req.body.email = normalizedEmail;
    req.body.jelszo = String(jelszo);

    return next();
}

function validateLogin(req, res, next) {
    const { email, jelszo } = req.body || {};

    if (!email || !jelszo) {
        return res.status(400).json({ message: 'Kérjük, add meg az email címet és a jelszót!' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
        return res.status(400).json({ message: 'Kérjük, add meg az email címet és a jelszót!' });
    }

    req.body.email = normalizedEmail;
    req.body.jelszo = String(jelszo);

    return next();
}

module.exports = {
    validateRegister,
    validateLogin
};
