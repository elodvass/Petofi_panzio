const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'Szoba',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            szobaszam: {
                type: DataTypes.STRING(10),
                allowNull: false,
                unique: true
            },
            ferohely: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            ar_per_ej: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            leiras: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            allapot: {
                type: DataTypes.ENUM('szabad', 'foglalt', 'takaritas_alatt'),
                allowNull: false,
                defaultValue: 'szabad',
                validate: {
                    isIn: [['szabad', 'foglalt', 'takaritas_alatt']]
                }
            }
        },
        {
            tableName: 'szobak',
            timestamps: false
        }
    );
};
