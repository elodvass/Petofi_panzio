const crypto = require('crypto');
const felhasznaloRepository = require('../repositories/felhasznaloRepository');

function createServiceError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    if (!stored || typeof password !== 'string') return false;
    if (!stored.includes(':')) {
        // Egyszerű sima szöveges jelszó támogatása (ha kézzel lett beírva teszteléskor)
        return password === stored;
    }
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    const hashBuf = crypto.scryptSync(password, salt, 64);
    const keyBuf = Buffer.from(key, 'hex');
    if (hashBuf.length !== keyBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, keyBuf);
}

function toPublicUser(user) {
    return {
        id: user.id,
        nev: user.nev,
        email: user.email,
        szerepkor: user.szerepkor
    };
}

async function registerGuest({ nev, email, jelszo }) {
    const trimmedName = String(nev).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await felhasznaloRepository.findIdByEmail(normalizedEmail);
    if (existing) {
        throw createServiceError('Ezzel az email címmel már regisztráltak!', 409);
    }

    const hashedPassword = hashPassword(String(jelszo));

    try {
        // Szándékosan 'vendeg' szerepkörrel rögzítjük
        const newUser = await felhasznaloRepository.createUser({
            nev: trimmedName,
            email: normalizedEmail,
            jelszo: hashedPassword,
            szerepkor: 'vendeg'
        });

        return toPublicUser(newUser);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw createServiceError('Ezzel az email címmel már regisztráltak!', 409);
        }
        throw error;
    }
}

async function loginUser({ email, jelszo }) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await felhasznaloRepository.findByEmail(normalizedEmail);

    if (!user) {
        throw createServiceError('Hibás email cím vagy jelszó!', 401);
    }

    const isMatch = verifyPassword(String(jelszo), user.jelszo);
    if (!isMatch) {
        throw createServiceError('Hibás email cím vagy jelszó!', 401);
    }

    return toPublicUser(user);
}

module.exports = {
    hashPassword,
    verifyPassword,
    registerGuest,
    loginUser
};
