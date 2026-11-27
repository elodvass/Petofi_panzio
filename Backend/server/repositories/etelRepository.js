const { Op } = require('sequelize');
const { Etel, NapiMenu } = require('../models');

async function findAllOrderedById() {
    return Etel.findAll({
        order: [['id', 'ASC']]
    });
}

async function findByIds(ids) {
    if (!ids.length) return [];
    return Etel.findAll({
        where: {
            id: { [Op.in]: ids }
        }
    });
}

async function findDailyMenusByDate(datum) {
    return NapiMenu.findAll({
        where: { datum },
        include: [
            {
                model: Etel,
                as: 'etel'
            }
        ],
        order: [['id', 'ASC']]
    });
}

async function findDailyMenusByDateRange(startDate, endDate) {
    return NapiMenu.findAll({
        where: {
            datum: { [Op.between]: [startDate, endDate] }
        },
        include: [
            {
                model: Etel,
                as: 'etel'
            }
        ],
        order: [
            ['datum', 'ASC'],
            ['id', 'ASC']
        ]
    });
}

module.exports = {
    findAllOrderedById,
    findByIds,
    findDailyMenusByDate,
    findDailyMenusByDateRange
};
