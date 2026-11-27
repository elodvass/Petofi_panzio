const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'NapiMenu',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            datum: {
                type: DataTypes.DATEONLY,
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
            etel_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'etelek',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            }
        },
        {
            tableName: 'napi_menuk',
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    name: 'uq_napi_menuk_datum_kategoria_opcio',
                    fields: ['datum', 'kategoria', 'opcio']
                },
                {
                    name: 'idx_napi_menuk_etel_id',
                    fields: ['etel_id']
                }
            ],
            validate: {
                opcioEgyezikKategoriaval() {
                    if ((this.kategoria === 'reggeli' || this.kategoria === 'vacsora') && this.opcio !== 'fix') {
                        throw new Error('Reggeli és vacsora esetén a napi menü opciója csak "fix" lehet.');
                    }
                    if (this.kategoria === 'ebed' && !['A', 'B'].includes(this.opcio)) {
                        throw new Error('Ebéd esetén a napi menü opciója csak "A" vagy "B" lehet.');
                    }
                }
            }
        }
    );
};
