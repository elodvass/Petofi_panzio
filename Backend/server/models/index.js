const { sequelize } = require('../db');

const Felhasznalo = require('./Felhasznalo')(sequelize);
const Szoba = require('./Szoba')(sequelize);
const Felszereles = require('./Felszereles')(sequelize);
const SzobaFelszereles = require('./SzobaFelszereles')(sequelize);
const Etel = require('./Etel')(sequelize);
const NapiMenu = require('./NapiMenu')(sequelize);
const Foglalas = require('./Foglalas')(sequelize);
const EtkezesiRendeles = require('./EtkezesiRendeles')(sequelize);

// Felhasználó <-> Foglalás (1:N)
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

// Szoba <-> Foglalás (1:N)
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

// Szoba <-> Felszerelés (N:M kapcsolótábla: szoba_felszerelesek)
Szoba.belongsToMany(Felszereles, {
    through: SzobaFelszereles,
    foreignKey: 'szoba_id',
    otherKey: 'felszereles_id',
    as: 'felszerelesek'
});
Felszereles.belongsToMany(Szoba, {
    through: SzobaFelszereles,
    foreignKey: 'felszereles_id',
    otherKey: 'szoba_id',
    as: 'szobak'
});

// Étel <-> Napi menü (1:N)
Etel.hasMany(NapiMenu, {
    foreignKey: 'etel_id',
    as: 'napiMenuk',
    onDelete: 'CASCADE'
});
NapiMenu.belongsTo(Etel, {
    foreignKey: 'etel_id',
    as: 'etel',
    onDelete: 'CASCADE'
});

// Foglalás <-> Étkezési rendelés <-> Étel (kapcsolótábla: etkezesi_rendelesek)
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

Foglalas.belongsToMany(Etel, {
    through: { model: EtkezesiRendeles, unique: false },
    foreignKey: 'foglalas_id',
    otherKey: 'etel_id',
    as: 'etelek'
});
Etel.belongsToMany(Foglalas, {
    through: { model: EtkezesiRendeles, unique: false },
    foreignKey: 'etel_id',
    otherKey: 'foglalas_id',
    as: 'foglalasok'
});

module.exports = {
    sequelize,
    Felhasznalo,
    Szoba,
    Felszereles,
    SzobaFelszereles,
    Etel,
    NapiMenu,
    Foglalas,
    EtkezesiRendeles
};
