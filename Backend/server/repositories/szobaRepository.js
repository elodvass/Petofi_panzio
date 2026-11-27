const { Szoba } = require('../models');

async function findAllOrderedByRoomNumber() {
    return Szoba.findAll({
        order: [['szobaszam', 'ASC']]
    });
}

module.exports = {
    findAllOrderedByRoomNumber
};
