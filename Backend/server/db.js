const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbPath = process.env.DB_PATH
    ? path.resolve(__dirname, '..', process.env.DB_PATH)
    : path.resolve(__dirname, '../database/petofi_panzio.sqlite');

const schemaPath = path.resolve(__dirname, '../database/petofi_panzio.sqlite');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

let rawDb;

const ready = new Promise((resolve, reject) => {
    rawDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Nem sikerült megnyitni az SQLite adatbázist:', err.message);
            return reject(err);
        }

        rawDb.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
            if (pragmaErr) {
                console.error('❌ Nem sikerült bekapcsolni a foreign_keys támogatást:', pragmaErr.message);
                return reject(pragmaErr);
            }

            rawDb.get(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'felhasznalok'",
                (checkErr, row) => {
                    if (checkErr) {
                        console.error('❌ Hiba az adatbázis ellenőrzésekor:', checkErr.message);
                        return reject(checkErr);
                    }

                    if (row) {
                        console.log(`✅ Sikeres kapcsolat az SQLite adatbázissal: ${dbPath}`);
                        return resolve(rawDb);
                    }

                    try {
                        const initSql = fs.readFileSync(schemaPath, 'utf8');
                        rawDb.exec(initSql, (execErr) => {
                            if (execErr) {
                                console.error('❌ Hiba az SQLite adatbázis inicializálásakor:', execErr.message);
                                return reject(execErr);
                            }
                            console.log(`✅ SQLite adatbázis létrehozva és feltöltve: ${dbPath}`);
                            resolve(rawDb);
                        });
                    } catch (readErr) {
                        console.error('❌ Nem sikerült beolvasni az SQL szkriptet:', readErr.message);
                        reject(readErr);
                    }
                }
            );
        });
    });
});

function isReadQuery(sql) {
    const cleaned = sql.replace(/^(\s*(--[^\n]*\n|\/\*[\s\S]*?\*\/))*\s*/i, '');
    return /^(SELECT|PRAGMA|WITH|EXPLAIN)\b/i.test(cleaned) || /\bRETURNING\b/i.test(cleaned);
}

async function all(sql, params = []) {
    const database = await ready;
    return new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

async function get(sql, params = []) {
    const database = await ready;
    return new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

async function run(sql, params = []) {
    const database = await ready;
    return new Promise((resolve, reject) => {
        database.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({
                insertId: this.lastID,
                lastID: this.lastID,
                affectedRows: this.changes,
                changes: this.changes
            });
        });
    });
}

async function exec(sql) {
    const database = await ready;
    return new Promise((resolve, reject) => {
        database.exec(sql, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

// Kompatibilis wrapper: [rows] vagy [result] formátumban tér vissza
async function query(sql, params = []) {
    if (isReadQuery(sql)) {
        const rows = await all(sql, params);
        return [rows];
    }
    const result = await run(sql, params);
    return [result];
}

async function close() {
    const database = await ready;
    return new Promise((resolve, reject) => {
        database.close((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

module.exports = {
    query,
    all,
    get,
    run,
    exec,
    close,
    ready,
    dbPath
};
