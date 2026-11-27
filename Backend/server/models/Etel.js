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
            opcio: {
                type: DataTypes.ENUM('fix', 'A', 'B'),
                allowNull: false,
                defaultValue: 'fix',
                validate: {
                    isIn: [['fix', 'A', 'B']]
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
            timestamps: false,
            validate: {
                opcioEgyezikKategoriaval() {
                    if ((this.kategoria === 'reggeli' || this.kategoria === 'vacsora') && this.opcio !== 'fix') {
                        throw new Error('Reggeli és vacsora esetén az opció csak "fix" lehet.');
                    }
                    if (this.kategoria === 'ebed' && !['A', 'B'].includes(this.opcio)) {
                        throw new Error('Ebéd esetén az opció csak "A" vagy "B" lehet.');
                    }
                }
            }
        }
    );
};
