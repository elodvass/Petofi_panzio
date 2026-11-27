const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'EtkezesiRendeles',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            foglalas_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'foglalasok',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            datum: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            etel_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'etelek',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            adag: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    isInt: true,
                    min: 1,
                    max: 5
                }
            },
            statusz: {
                type: DataTypes.ENUM('keszuloben', 'elkeszult', 'kiadva'),
                allowNull: false,
                defaultValue: 'keszuloben',
                validate: {
                    isIn: [['keszuloben', 'elkeszult', 'kiadva']]
                }
            }
        },
        {
            tableName: 'etkezesi_rendelesek',
            timestamps: false
        }
    );
};
