# Petőfi Panzió - Backend

Node.js, Express.js és Sequelize ORM (SQLite) alapú, rétegzett felépítésű backend a Petőfi Panzió projekt számára.

## Mappaszerkezet

- `server/`
  - `server.js`: Belépési pont, Express alkalmazás, globális middleware-ek és szerverindítás.
  - `db.js`: Sequelize adatbázis-kapcsolat az SQLite fájlhoz.
  - `models/`: **Models (ORM)** – Sequelize adatmodellek és kapcsolatok (`Felhasznalo`, `Szoba`, `Etel`, `Foglalas`, `EtkezesiRendeles`, `index.js`).
  - `routes/`: **Router** – API útvonalak (`index.js`, `statusRoutes.js`, `authRoutes.js`, `szobaRoutes.js`, `etelRoutes.js`).
  - `middlewares/`: **Middleware** – Kérés-validáció (`validateAuth.js`), 404 és központi hibakezelés (`errorHandler.js`).
  - `controllers/`: **Controller** – HTTP kérések/válaszok kezelése (`statusController.js`, `authController.js`, `szobaController.js`, `etelController.js`).
  - `services/`: **Service** – Üzleti logika (`statusService.js`, `authService.js`, `szobaService.js`, `etelService.js`).
  - `repositories/`: **Repositories** – Adatbázis-hozzáférés Sequelize-on keresztül (`statusRepository.js`, `felhasznaloRepository.js`, `szobaRepository.js`, `etelRepository.js`).
- `database/`
  - `petofi_panzio.sqlite`: Előre elkészített SQLite adatbázisfájl a táblákkal és mintaadatokkal.
- `.env.example`: Környezeti változók mintája.

## Adatfolyam

`Router` → (`Middleware`) → `Controller` → `Service` → `Repository (Sequelize)` → `Models (ORM)` → `SQLite Database`

## Telepítés és Futtatás

1. Szükséges csomagok telepítése (ha még nincsenek):
   ```bash
   npm install
   ```

2. (Opcionális) `.env` fájl létrehozása a `.env.example` alapján, ha egyedi portot vagy adatbázis-elérési utat szeretnél megadni:
   ```bash
   cp .env.example .env
   ```

3. Adatbázis:
   - Nem igényel külön MySQL szervert, phpMyAdmin importot vagy `.sql` fájlt!
   - A szerver Sequelize ORM-en keresztül közvetlenül a `database/petofi_panzio.sqlite` fájlt használja (az `sqlite3` csomag a Sequelize belső dialect drivereként szükséges marad a `package.json`-ben).

4. Szerver indítása:
   ```bash
   # Fejlesztői módban (automatikus újraindulás):
   npm run dev

   # Normál indítás:
   npm start
   ```
