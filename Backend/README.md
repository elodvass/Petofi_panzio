# Petőfi Panzió - Backend

Node.js és Express.js alapú backend a Petőfi Panzió projekt számára.

## Mappaszerkezet

- `server/`
  - `server.js`: Az Express webszerver és API végpontok.
  - `db.js`: MySQL adatbázis-kapcsolat (pool).
- `database/`
  - `petofi_panzio.sql`: Adatbázis létrehozó és mintaadatokat feltöltő SQL script.
- `.env.example`: Környezeti változók mintája.

## Telepítés és Futtatás

1. Szükséges csomagok telepítése (ha még nincsenek):
   ```bash
   npm install
   ```

2. `.env` fájl létrehozása (a `.env.example` alapján, szükség esetén a jelszó módosításával):
   ```bash
   cp .env.example .env
   ```

3. Adatbázis importálása:
   - Nyisd meg a phpMyAdmin-t vagy a MySQL munkafelületet, és futtasd le a `database/petofi_panzio.sql` szkriptet.

4. Szerver indítása:
   ```bash
   # Fejlesztői módban (automatikus újraindulás):
   npm run dev

   # Normál indítás:
   npm start
   ```
