const szobaRepository = require('../repositories/szobaRepository');

async function getAllRooms() {
    return szobaRepository.findAllOrderedByRoomNumber();
}

module.exports = {
    getAllRooms
};
