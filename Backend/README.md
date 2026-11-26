# Petőfi Panzió - Backend

Node.js, Express.js és SQLite alapú backend a Petőfi Panzió projekt számára.

## Mappaszerkezet

- `server/`
  - `server.js`: Az Express webszerver és API végpontok.
  - `db.js`: SQLite adatbázis-kapcsolat.
- `database/`
  - `petofi_panzio.sqlite`: Előre elkészített SQLite adatbázisfájl a táblákkal és mintaadatokkal.
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

3. Adatbázis:
   - Nem igényel külön MySQL szervert, phpMyAdmin importot vagy `.sql` fájlt!
   - A szerver közvetlenül a `database/petofi_panzio.sqlite` fájlt használja.

4. Szerver indítása:
   ```bash
   # Fejlesztői módban (automatikus újraindulás):
   npm run dev

   # Normál indítás:
   npm start
   ```
