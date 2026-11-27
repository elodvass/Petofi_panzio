const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'Foglalas',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            felhasznalo_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'felhasznalok',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            szoba_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'szobak',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            erkezes_datum: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            tavozas_datum: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            vendegek_szama: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            statusz: {
                type: DataTypes.ENUM('fuggoben', 'megerositve', 'lemondva'),
                allowNull: false,
                defaultValue: 'fuggoben',
                validate: {
                    isIn: [['fuggoben', 'megerositve', 'lemondva']]
                }
            }
        },
        {
            tableName: 'foglalasok',
            timestamps: true,
            createdAt: 'letrehozva',
            updatedAt: false
        }
    );
};
