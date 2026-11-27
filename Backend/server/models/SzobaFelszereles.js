const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'SzobaFelszereles',
        {
            szoba_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'szobak',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            felszereles_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'felszerelesek',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            }
        },
        {
            tableName: 'szoba_felszerelesek',
            timestamps: false
        }
    );
};
