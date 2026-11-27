const { Etel } = require('../models');

async function findAllOrderedById() {
    return Etel.findAll({
        order: [['id', 'ASC']]
    });
}

module.exports = {
    findAllOrderedById
};
