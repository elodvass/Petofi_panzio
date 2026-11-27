const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const rawDbPath = process.env.DB_PATH ? process.env.DB_PATH.trim() : '';
const isMemoryDb = rawDbPath === ':memory:';
const dbPath = isMemoryDb
    ? ':memory:'
    : rawDbPath
        ? path.resolve(__dirname, '..', rawDbPath)
        : path.resolve(__dirname, '../database/petofi_panzio.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    foreignKeys: true,
    retry: {
        match: [/SQLITE_BUSY/],
        max: 5
    }
});

const REQUIRED_TABLES = [
    'felhasznalok',
    'szobak',
    'etelek',
    'foglalasok',
    'etkezesi_rendelesek'
];

async function initDb() {
    if (!isMemoryDb && !fs.existsSync(dbPath)) {
        const missingErr = new Error(`Az SQLite adatbázisfájl nem található: ${dbPath}`);
        console.error('❌', missingErr.message);
        throw missingErr;
    }

    await sequelize.authenticate();

    const existingTables = await sequelize.getQueryInterface().showAllTables();
    const tableNames = existingTables.map((table) =>
        typeof table === 'string' ? table : table.tableName || table.name
    );
    const missingTables = REQUIRED_TABLES.filter((table) => !tableNames.includes(table));

    if (missingTables.length > 0) {
        const schemaErr = new Error(
            `Az SQLite adatbázis nem tartalmazza a szükséges táblákat (${missingTables.join(', ')}): ${dbPath}`
        );
        console.error('❌', schemaErr.message);
        throw schemaErr;
    }

    console.log(`✅ Sikeres Sequelize kapcsolat az SQLite adatbázissal: ${dbPath}`);
    return sequelize;
}

async function close() {
    await sequelize.close();
}

module.exports = {
    sequelize,
    initDb,
    close,
    dbPath
};
