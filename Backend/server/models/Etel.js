const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'Etel',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            nev: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            kategoria: {
                type: DataTypes.ENUM('reggeli', 'ebed', 'vacsora'),
                allowNull: false,
                validate: {
                    isIn: [['reggeli', 'ebed', 'vacsora']]
                }
            },
            leiras: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            ar: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: 'etelek',
            timestamps: false
        }
    );
};
