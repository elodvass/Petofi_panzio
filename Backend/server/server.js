const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { initDb, close } = require('./db');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;

// Globális middleware-ek
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Útvonalak (Router)
app.use(routes);

// 404 és központi hibakezelő middleware-ek
app.use(notFoundHandler);
app.use(errorHandler);

// Szerver indítása az adatbázis inicializálása után
async function startServer() {
    try {
        await initDb();

        const onListen = () => {
            const displayHost = HOST || 'localhost';
            console.log(`🚀 Szerver fut a következő címen: http://${displayHost}:${PORT}`);
        };

        const server = HOST
            ? app.listen(PORT, HOST, onListen)
            : app.listen(PORT, onListen);

        const shutdown = async () => {
            server.close(async () => {
                try {
                    await close();
                } finally {
                    process.exit(0);
                }
            });
        };

        process.once('SIGINT', shutdown);
        process.once('SIGTERM', shutdown);

        return server;
    } catch (err) {
        console.error('❌ A szerver nem indult el adatbázis-hiba miatt:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
