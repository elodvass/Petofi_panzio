const { sequelize } = require('../db');

async function authenticate() {
    await sequelize.authenticate();
    return {
        dialect: sequelize.getDialect()
    };
}

module.exports = {
    authenticate
};
