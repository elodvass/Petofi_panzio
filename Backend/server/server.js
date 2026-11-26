const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware-ek
app.use(cors());
app.use(express.json());

// Jelszó hashelés beépített Node.js crypto modullal
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    if (!stored) return false;
    if (!stored.includes(':')) {
        // Egyszerű sima szöveges jelszó támogatása (ha kézzel lett beírva teszteléskor)
        return password === stored;
    }
    const [salt, key] = stored.split(':');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return key === hash;
}

// Alapértelmezett útvonal
app.get('/', (req, res) => {
    res.json({ message: 'Petőfi Panzió API szerver fut.' });
});

// Teszt útvonal az adatbázis ellenőrzéséhez
app.get('/api/status', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ status: 'ok', db: 'connected', engine: 'sqlite', result: rows[0].solution });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- AUTH VÉGPONTOK ---

// Regisztráció (Kifejezetten csak vendégként lehet regisztrálni)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nev, email, jelszo } = req.body;

        if (!nev || !email || !jelszo) {
            return res.status(400).json({ message: 'Minden mező kitöltése kötelező!' });
        }

        const trimmedName = nev.trim();
        const normalizedEmail = email.trim().toLowerCase();

        // Ellenőrizzük, hogy létezik-e már az email
        const [existing] = await db.query('SELECT id FROM felhasznalok WHERE email = ?', [normalizedEmail]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Ezzel az email címmel már regisztráltak!' });
        }

        const hashedPassword = hashPassword(jelszo);
        // Szándékosan 'vendeg' szerepkörrel rögzítjük
        const [result] = await db.query(
            'INSERT INTO felhasznalok (nev, email, jelszo, szerepkor) VALUES (?, ?, ?, ?)',
            [trimmedName, normalizedEmail, hashedPassword, 'vendeg']
        );

        res.status(201).json({
            message: 'Sikeres regisztráció!',
            user: {
                id: result.insertId,
                nev: trimmedName,
                email: normalizedEmail,
                szerepkor: 'vendeg'
            }
        });
    } catch (error) {
        console.error('Regisztrációs hiba:', error);
        res.status(500).json({ message: 'Hiba történt a regisztráció során.' });
    }
});

// Bejelentkezés
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, jelszo } = req.body;

        if (!email || !jelszo) {
            return res.status(400).json({ message: 'Kérjük, add meg az email címet és a jelszót!' });
        }

        const [users] = await db.query('SELECT * FROM felhasznalok WHERE email = ?', [email.trim().toLowerCase()]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Hibás email cím vagy jelszó!' });
        }

        const user = users[0];
        const isMatch = verifyPassword(jelszo, user.jelszo);

        if (!isMatch) {
            return res.status(401).json({ message: 'Hibás email cím vagy jelszó!' });
        }

        res.json({
            message: 'Sikeres bejelentkezés!',
            user: {
                id: user.id,
                nev: user.nev,
                email: user.email,
                szerepkor: user.szerepkor
            }
        });
    } catch (error) {
        console.error('Bejelentkezési hiba:', error);
        res.status(500).json({ message: 'Hiba történt a bejelentkezés során.' });
    }
});

// --- PANZIÓ ADAT VÉGPONTOK ---

// Szobák listázása
app.get('/api/szobak', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM szobak ORDER BY szobaszam ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Nem sikerült lekérni a szobákat.' });
    }
});

// Étlap listázása
app.get('/api/etelek', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM etelek
            ORDER BY CASE kategoria
                WHEN 'reggeli' THEN 1
                WHEN 'ebed' THEN 2
                WHEN 'vacsora' THEN 3
                ELSE 4
            END ASC, id ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Nem sikerült lekérni az ételeket.' });
    }
});

// Szerver indítása az adatbázis inicializálása után
db.ready
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Szerver fut a következő címen: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ A szerver nem indult el adatbázis-hiba miatt:', err.message);
        process.exit(1);
    });
