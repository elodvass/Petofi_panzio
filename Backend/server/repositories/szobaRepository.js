const { Op } = require('sequelize');
const { Szoba, Felszereles, Foglalas } = require('../models');

async function findAllWithFelszerelesek() {
    return Szoba.findAll({
        include: [
            {
                model: Felszereles,
                as: 'felszerelesek',
                attributes: ['id', 'nev'],
                through: { attributes: [] }
            }
        ],
        order: [
            ['szobaszam', 'ASC'],
            [{ model: Felszereles, as: 'felszerelesek' }, 'nev', 'ASC']
        ]
    });
}

async function findByIdWithFelszerelesek(id) {
    return Szoba.findByPk(id, {
        include: [
            {
                model: Felszereles,
                as: 'felszerelesek',
                attributes: ['id', 'nev'],
                through: { attributes: [] }
            }
        ],
        order: [[{ model: Felszereles, as: 'felszerelesek' }, 'nev', 'ASC']]
    });
}

async function findBookedRoomIdsInRange(erkezes, tavozas) {
    const overlapping = await Foglalas.findAll({
        where: {
            statusz: { [Op.ne]: 'lemondva' },
            erkezes_datum: { [Op.lt]: tavozas },
            tavozas_datum: { [Op.gt]: erkezes }
        },
        attributes: ['szoba_id']
    });

    return new Set(overlapping.map((row) => row.szoba_id));
}

module.exports = {
    findAllWithFelszerelesek,
    findByIdWithFelszerelesek,
    findBookedRoomIdsInRange
};
