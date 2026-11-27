const { Felhasznalo } = require('../models');

async function findByEmail(email) {
    return Felhasznalo.findOne({
        where: { email }
    });
}

async function findIdByEmail(email) {
    return Felhasznalo.findOne({
        where: { email },
        attributes: ['id']
    });
}

async function createUser({ nev, email, jelszo, szerepkor = 'vendeg' }) {
    return Felhasznalo.create({
        nev,
        email,
        jelszo,
        szerepkor
    });
}

module.exports = {
    findByEmail,
    findIdByEmail,
    createUser
};
