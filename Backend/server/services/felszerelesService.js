const felszerelesRepository = require('../repositories/felszerelesRepository');

async function getAllFelszerelesek() {
    return felszerelesRepository.findAllOrdered();
}

module.exports = {
    getAllFelszerelesek
};
