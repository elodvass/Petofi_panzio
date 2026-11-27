const { Felszereles } = require('../models');

async function findAllOrdered() {
    return Felszereles.findAll({
        order: [['nev', 'ASC']]
    });
}

module.exports = {
    findAllOrdered
};
