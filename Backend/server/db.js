const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'petofi_panzio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kapcsolat tesztelése
pool.getConnection()
    .then(connection => {
        console.log('✅ Sikeres kapcsolat az adatbázissal!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Nem sikerült kapcsolódni az adatbázishoz:', err.message);
    });

module.exports = pool;

