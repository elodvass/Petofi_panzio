const { sequelize } = require('../db');

const Felhasznalo = require('./Felhasznalo')(sequelize);
const Szoba = require('./Szoba')(sequelize);
const Etel = require('./Etel')(sequelize);
const Foglalas = require('./Foglalas')(sequelize);
const EtkezesiRendeles = require('./EtkezesiRendeles')(sequelize);

// Asszociációk (ON DELETE CASCADE)
Felhasznalo.hasMany(Foglalas, {
    foreignKey: 'felhasznalo_id',
    as: 'foglalasok',
    onDelete: 'CASCADE'
});
Foglalas.belongsTo(Felhasznalo, {
    foreignKey: 'felhasznalo_id',
    as: 'felhasznalo',
    onDelete: 'CASCADE'
});

Szoba.hasMany(Foglalas, {
    foreignKey: 'szoba_id',
    as: 'foglalasok',
    onDelete: 'CASCADE'
});
Foglalas.belongsTo(Szoba, {
    foreignKey: 'szoba_id',
    as: 'szoba',
    onDelete: 'CASCADE'
});

Foglalas.hasMany(EtkezesiRendeles, {
    foreignKey: 'foglalas_id',
    as: 'etkezesiRendelesek',
    onDelete: 'CASCADE'
});
EtkezesiRendeles.belongsTo(Foglalas, {
    foreignKey: 'foglalas_id',
    as: 'foglalas',
    onDelete: 'CASCADE'
});

Etel.hasMany(EtkezesiRendeles, {
    foreignKey: 'etel_id',
    as: 'etkezesiRendelesek',
    onDelete: 'CASCADE'
});
EtkezesiRendeles.belongsTo(Etel, {
    foreignKey: 'etel_id',
    as: 'etel',
    onDelete: 'CASCADE'
});

module.exports = {
    sequelize,
    Felhasznalo,
    Szoba,
    Etel,
    Foglalas,
    EtkezesiRendeles
};
