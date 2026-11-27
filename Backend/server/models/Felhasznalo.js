const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'Felhasznalo',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            nev: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },
            jelszo: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            szerepkor: {
                type: DataTypes.ENUM('vendeg', 'dolgozo', 'admin'),
                allowNull: false,
                defaultValue: 'vendeg',
                validate: {
                    isIn: [['vendeg', 'dolgozo', 'admin']]
                }
            }
        },
        {
            tableName: 'felhasznalok',
            timestamps: true,
            createdAt: 'letrehozva',
            updatedAt: false
        }
    );
};
