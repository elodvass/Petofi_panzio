const { Op } = require('sequelize');
const {
    sequelize,
    Foglalas,
    Felhasznalo,
    Szoba,
    Felszereles,
    EtkezesiRendeles,
    Etel
} = require('../models');

const DETAILED_INCLUDES = [
    {
        model: Felhasznalo,
        as: 'felhasznalo',
        attributes: ['id', 'nev', 'email', 'szerepkor']
    },
    {
        model: Szoba,
        as: 'szoba',
        include: [
            {
                model: Felszereles,
                as: 'felszerelesek',
                attributes: ['id', 'nev'],
                through: { attributes: [] }
            }
        ]
    },
    {
        model: EtkezesiRendeles,
        as: 'etkezesiRendelesek',
        include: [
            {
                model: Etel,
                as: 'etel'
            }
        ]
    }
];

async function findAllDetailed({ felhasznalo_id } = {}) {
    const where = {};
    if (felhasznalo_id !== undefined && felhasznalo_id !== null) {
        where.felhasznalo_id = felhasznalo_id;
    }

    return Foglalas.findAll({
        where,
        include: DETAILED_INCLUDES,
        order: [
            ['id', 'DESC'],
            [{ model: EtkezesiRendeles, as: 'etkezesiRendelesek' }, 'datum', 'ASC'],
            [{ model: EtkezesiRendeles, as: 'etkezesiRendelesek' }, 'id', 'ASC']
        ]
    });
}

async function findByIdDetailed(id) {
    return Foglalas.findByPk(id, {
        include: DETAILED_INCLUDES,
        order: [
            [{ model: EtkezesiRendeles, as: 'etkezesiRendelesek' }, 'datum', 'ASC'],
            [{ model: EtkezesiRendeles, as: 'etkezesiRendelesek' }, 'id', 'ASC']
        ]
    });
}

async function findOverlappingBooking({ szoba_id, erkezes_datum, tavozas_datum, excludeId, transaction } = {}) {
    const where = {
        szoba_id,
        statusz: { [Op.ne]: 'lemondva' },
        erkezes_datum: { [Op.lt]: tavozas_datum },
        tavozas_datum: { [Op.gt]: erkezes_datum }
    };

    if (excludeId !== undefined && excludeId !== null) {
        where.id = { [Op.ne]: excludeId };
    }

    return Foglalas.findOne({ where, transaction });
}

async function createBookingWithMeals({ bookingData, mealsData }) {
    const createdId = await sequelize.transaction(async (transaction) => {
        const overlapping = await findOverlappingBooking({
            szoba_id: bookingData.szoba_id,
            erkezes_datum: bookingData.erkezes_datum,
            tavozas_datum: bookingData.tavozas_datum,
            transaction
        });

        if (overlapping) {
            const err = new Error('Ez a szoba a megadott időszakban már foglalt!');
            err.statusCode = 409;
            throw err;
        }

        const foglalas = await Foglalas.create(bookingData, { transaction });

        if (mealsData.length > 0) {
            const rowsToInsert = mealsData.map((meal) => ({
                foglalas_id: foglalas.id,
                datum: meal.datum,
                etel_id: meal.etel_id,
                adag: meal.adag,
                statusz: 'keszuloben'
            }));
            await EtkezesiRendeles.bulkCreate(rowsToInsert, {
                transaction,
                validate: true
            });
        }

        return foglalas.id;
    });

    return findByIdDetailed(createdId);
}

async function updateStatus(id, statusz) {
    const foglalas = await Foglalas.findByPk(id);
    if (!foglalas) return null;

    await foglalas.update({ statusz });
    return findByIdDetailed(id);
}

async function deleteById(id) {
    const deletedCount = await Foglalas.destroy({
        where: { id }
    });
    return deletedCount > 0;
}

module.exports = {
    findAllDetailed,
    findByIdDetailed,
    findOverlappingBooking,
    createBookingWithMeals,
    updateStatus,
    deleteById
};
