const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware-ek
app.use(cors());
app.use(express.json());

// Alapértelmezett útvonal
app.get('/', (req, res) => {
    res.json({ message: 'Petőfi Panzió API szerver fut.' });
});

// Teszt útvonal az adatbázis ellenőrzéséhez
app.get('/api/status', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ status: 'ok', db: 'connected', result: rows[0].solution });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`🚀 Szerver fut a következő címen: http://localhost:${PORT}`);
});

