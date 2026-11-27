const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'Felszereles',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            nev: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            }
        },
        {
            tableName: 'felszerelesek',
            timestamps: false
        }
    );
};
