const statusRepository = require('../repositories/statusRepository');

async function getDatabaseStatus() {
    const { dialect } = await statusRepository.authenticate();
    return {
        status: 'ok',
        db: 'connected',
        orm: 'sequelize',
        engine: dialect
    };
}

module.exports = {
    getDatabaseStatus
};
