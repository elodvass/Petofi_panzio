const { DataTypes } = require('sequelize');
const {
    sequelize,
    Szoba,
    Felszereles,
    SzobaFelszereles,
    Etel,
    NapiMenu
} = require('../models');

const ALAP_FELSZERELESEK = [
    'Wi-Fi',
    'Klíma',
    'Erkély',
    'TV',
    'Minibár',
    'Saját fürdőszoba',
    'Panorámás kilátás'
];

const SZOBA_FELSZERELES_HOZZARENDELES = {
    '101': ['Wi-Fi', 'TV', 'Saját fürdőszoba'],
    '102': ['Wi-Fi', 'Klíma', 'Erkély', 'TV', 'Saját fürdőszoba'],
    '201': ['Wi-Fi', 'Klíma', 'Erkély', 'TV', 'Minibár', 'Saját fürdőszoba', 'Panorámás kilátás']
};

const EXTRA_ETELEK = [
    {
        nev: 'Magyaros reggeli',
        kategoria: 'reggeli',
        opcio: 'fix',
        leiras: 'Rántotta, házi kolbász, friss zöldségek, kenyér, tea/kávé',
        ar: 2700
    },
    {
        nev: 'A menü - Babgulyás, Ízes palacsinta',
        kategoria: 'ebed',
        opcio: 'A',
        leiras: 'Tartalmas magyaros ebéd menü',
        ar: 3900
    },
    {
        nev: 'B menü - Zöldségkrémleves, Grillezett csirkemell salátával',
        kategoria: 'ebed',
        opcio: 'B',
        leiras: 'Könnyed ebéd menü',
        ar: 3600
    },
    {
        nev: 'Meleg vacsora - Brassói aprópecsenye',
        kategoria: 'vacsora',
        opcio: 'fix',
        leiras: 'Frissen sült sertéshús fokhagymás burgonyával és savanyúsággal',
        ar: 3400
    }
];

function formatDateISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function ensureSchemaAndSeed() {
    await sequelize.authenticate();

    const queryInterface = sequelize.getQueryInterface();

    // 1. Etelek tábla bővítése az 'opcio' oszloppal, ha még nem létezik
    const etelekColumns = await queryInterface.describeTable('etelek');
    if (!etelekColumns.opcio) {
        await queryInterface.addColumn('etelek', 'opcio', {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'fix'
        });
    }

    // 2. Új táblák létrehozása (CREATE TABLE IF NOT EXISTS - a meglévő táblákat érintetlenül hagyja)
    await Felszereles.sync();
    await SzobaFelszereles.sync();
    await NapiMenu.sync();

    // 3. Meglévő ételek opcióinak pontos beállítása (reggeli/vacsora = fix, ebéd = A vagy B)
    const existingFoods = await Etel.findAll({ order: [['id', 'ASC']] });
    let ebedIndex = 0;
    for (const etel of existingFoods) {
        let targetOpcio = 'fix';
        if (etel.kategoria === 'ebed') {
            if (etel.nev.startsWith('B ') || etel.nev.includes('B menü')) {
                targetOpcio = 'B';
            } else if (etel.nev.startsWith('A ') || etel.nev.includes('A menü')) {
                targetOpcio = 'A';
            } else {
                targetOpcio = ebedIndex % 2 === 0 ? 'A' : 'B';
            }
            ebedIndex += 1;
        }
        if (etel.opcio !== targetOpcio) {
            await etel.update({ opcio: targetOpcio });
        }
    }

    // 4. Extra ételek hozzáadása (hogy naponta váltakozó napi menü is legyen)
    for (const food of EXTRA_ETELEK) {
        await Etel.findOrCreate({
            where: { nev: food.nev },
            defaults: food
        });
    }

    // 5. Felszerelések létrehozása
    const felszerelesMap = new Map();
    for (const nev of ALAP_FELSZERELESEK) {
        const [item] = await Felszereles.findOrCreate({
            where: { nev },
            defaults: { nev }
        });
        felszerelesMap.set(nev, item);
    }

    // 6. Szobák <-> Felszerelések összerendelése
    const szobak = await Szoba.findAll();
    for (const szoba of szobak) {
        const targetNames = SZOBA_FELSZERELES_HOZZARENDELES[szoba.szobaszam] || ['Wi-Fi', 'Saját fürdőszoba'];
        for (const nev of targetNames) {
            const felszereles = felszerelesMap.get(nev);
            if (felszereles) {
                await SzobaFelszereles.findOrCreate({
                    where: {
                        szoba_id: szoba.id,
                        felszereles_id: felszereles.id
                    },
                    defaults: {
                        szoba_id: szoba.id,
                        felszereles_id: felszereles.id
                    }
                });
            }
        }
    }

    // 7. Napi menük feltöltése 14 napra (fix reggeli, A és B ebéd, fix vacsora)
    const allFoods = await Etel.findAll({ order: [['id', 'ASC']] });
    const reggelik = allFoods.filter((e) => e.kategoria === 'reggeli' && e.opcio === 'fix');
    const ebedekA = allFoods.filter((e) => e.kategoria === 'ebed' && e.opcio === 'A');
    const ebedekB = allFoods.filter((e) => e.kategoria === 'ebed' && e.opcio === 'B');
    const vacsorak = allFoods.filter((e) => e.kategoria === 'vacsora' && e.opcio === 'fix');

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    for (let offset = 0; offset < 14; offset += 1) {
        const current = new Date(startDate);
        current.setDate(startDate.getDate() + offset);
        const datum = formatDateISO(current);

        const daySlots = [
            { kategoria: 'reggeli', opcio: 'fix', etel: reggelik[offset % reggelik.length] },
            { kategoria: 'ebed', opcio: 'A', etel: ebedekA[offset % ebedekA.length] },
            { kategoria: 'ebed', opcio: 'B', etel: ebedekB[offset % ebedekB.length] },
            { kategoria: 'vacsora', opcio: 'fix', etel: vacsorak[offset % vacsorak.length] }
        ];

        for (const slot of daySlots) {
            if (!slot.etel) continue;
            await NapiMenu.findOrCreate({
                where: {
                    datum,
                    kategoria: slot.kategoria,
                    opcio: slot.opcio
                },
                defaults: {
                    datum,
                    kategoria: slot.kategoria,
                    opcio: slot.opcio,
                    etel_id: slot.etel.id
                }
            });
        }
    }

    console.log('✅ SQLite adatbázis séma és mintaadatok sikeresen frissítve Sequelize-szal!');
}

if (require.main === module) {
    ensureSchemaAndSeed()
        .then(() => sequelize.close())
        .catch(async (err) => {
            console.error('❌ Hiba a seeder futtatása közben:', err);
            await sequelize.close().catch(() => {});
            process.exit(1);
        });
}

module.exports = {
    ensureSchemaAndSeed
};
