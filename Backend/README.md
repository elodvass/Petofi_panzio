# Petőfi Panzió - Backend

Node.js, Express.js és SQLite alapú backend a Petőfi Panzió projekt számára.

## Mappaszerkezet

- `server/`
  - `server.js`: Az Express webszerver és API végpontok.
  - `db.js`: SQLite adatbázis-kapcsolat és automatikus inicializálás.
- `database/`
  - `petofi_panzio.sql`: SQLite adatbázis séma és mintaadatok.
  - `petofi_panzio.sqlite`: Az első indításkor automatikusan létrejövő SQLite adatbázisfájl.
- `.env.example`: Környezeti változók mintája.

## Telepítés és Futtatás

1. Szükséges csomagok telepítése (ha még nincsenek):
   ```bash
   npm install
   ```

2. (Opcionális) `.env` fájl létrehozása a `.env.example` alapján, ha egyedi portot vagy adatbázis-elérési utat szeretnél megadni:
   ```bash
   cp .env.example .env
   ```

3. Adatbázis inicializálása:
   - Nem igényel külön MySQL szervert vagy phpMyAdmin importot!
   - A szerver első indításakor automatikusan létrehozza a `database/petofi_panzio.sqlite` fájlt és betölti a `database/petofi_panzio.sql` tábláit és mintaadatait.
   - Ha tiszta adatbázissal szeretnél újrakezdeni, egyszerűen töröld a `database/petofi_panzio.sqlite` fájlt és indítsd újra a szervert.

4. Szerver indítása:
   ```bash
   # Fejlesztői módban (automatikus újraindulás):
   npm run dev

   # Normál indítás:
   npm start
   ```
