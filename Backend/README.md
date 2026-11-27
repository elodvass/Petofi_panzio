# Petőfi Panzió - Backend

Node.js, Express.js és Sequelize ORM (SQLite) alapú, rétegzett felépítésű backend a Petőfi Panzió projekt számára.

## Mappaszerkezet

- `server/`
  - `server.js`: Belépési pont, Express alkalmazás, globális middleware-ek és szerverindítás.
  - `db.js`: Sequelize adatbázis-kapcsolat az SQLite fájlhoz.
  - `models/`: **Models (ORM)** – Sequelize adatmodellek és kapcsolatok (`Felhasznalo`, `Szoba`, `Felszereles`, `SzobaFelszereles`, `Etel`, `NapiMenu`, `Foglalas`, `EtkezesiRendeles`, `index.js`).
  - `routes/`: **Router** – API útvonalak (`index.js`, `statusRoutes.js`, `authRoutes.js`, `felszerelesRoutes.js`, `szobaRoutes.js`, `etelRoutes.js`, `napiMenuRoutes.js`, `foglalasRoutes.js`).
  - `middlewares/`: **Middleware** – Kérés-validáció (`validateAuth.js`, `validateFoglalas.js`), 404 és központi hibakezelés (`errorHandler.js`).
  - `controllers/`: **Controller** – HTTP kérések/válaszok kezelése (`statusController.js`, `authController.js`, `felszerelesController.js`, `szobaController.js`, `etelController.js`, `foglalasController.js`).
  - `services/`: **Service** – Üzleti logika (`statusService.js`, `authService.js`, `felszerelesService.js`, `szobaService.js`, `etelService.js`, `foglalasService.js`).
  - `repositories/`: **Repositories** – Adatbázis-hozzáférés Sequelize-on keresztül (`statusRepository.js`, `felhasznaloRepository.js`, `felszerelesRepository.js`, `szobaRepository.js`, `etelRepository.js`, `foglalasRepository.js`).
  - `seeders/`: `seed.js` – Sequelize alapú sémafrissítés és mintaadat-feltöltés (külön `.sql` fájl nélkül).
- `database/`
  - `petofi_panzio.sqlite`: SQLite adatbázisfájl mind a 8 táblával és mintaadatokkal.
- `.env.example`: Környezeti változók mintája.

## Adatbázis táblák (SQLite)

1. `felhasznalok` – vendég, dolgozó, admin fiókok
2. `szobak` – szobák alapadatai
3. `felszerelesek` – szobafelszerelések szótártáblája (`Wi-Fi`, `Klíma`, `Erkély`, `TV`, `Minibár`, stb.)
4. `szoba_felszerelesek` – N:M kapcsolótábla a szobák és felszerelések között
5. `etelek` – ételek kategóriával (`reggeli`, `ebed`, `vacsora`) és opcióval (`fix`, `A`, `B`)
6. `napi_menuk` – napi menübeosztás (`UNIQUE(datum, kategoria, opcio)`): naponta 1 fix reggeli, 2 ebéd opció (`A`, `B`) és 1 fix vacsora
7. `foglalasok` – pontos dátumra szóló szobafoglalások (`erkezes_datum`, `tavozas_datum`)
8. `etkezesi_rendelesek` – étkezések kapcsolótáblája a foglalásokhoz (kategóriánként és naponta max. 5 adag)

## Főbb API végpontok

- `GET /api/status` – Adatbázis és Sequelize kapcsolat ellenőrzése
- `POST /api/auth/register`, `POST /api/auth/login` – Regisztráció és bejelentkezés
- `GET /api/felszerelesek` – Felszerelések listázása
- `GET /api/szobak` – Szobák listázása felszerelésekkel; opcionálisan `?erkezes=ÉÉÉÉ-HH-NN&tavozas=ÉÉÉÉ-HH-NN` (és `&csak_szabad=true`) pontos dátumszűréssel
- `GET /api/etelek` – Összes étel opciókkal
- `GET /api/napi-menu?datum=ÉÉÉÉ-HH-NN` vagy `?erkezes=...&tavozas=...` – Napi fix reggeli, A/B ebéd és fix vacsora
- `GET /api/foglalasok`, `GET /api/foglalasok/:id`, `POST /api/foglalasok`, `PATCH /api/foglalasok/:id/statusz`, `DELETE /api/foglalasok/:id` – Foglalások és étkezési rendelések kezelése

## Telepítés és Futtatás

1. Csomagok telepítése:
   ```bash
   npm install
   ```

2. (Opcionális) `.env` fájl létrehozása a `.env.example` alapján:
   ```bash
   cp .env.example .env
   ```

3. Adatbázis:
   - Közvetlenül a `database/petofi_panzio.sqlite` fájlt használja Sequelize ORM-mel (nincs `.sql` fájl és nem kell külön MySQL szerver).
   - Mintaadatok frissítése (idempotens): `npm run seed`

4. Szerver indítása:
   ```bash
   npm run dev
   # vagy
   npm start
   ```
