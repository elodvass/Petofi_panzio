# Petőfi Panzió – Terminológia és Fogalomtár

## 1. A Dokumentum Célja
Jelen dokumentum célja, hogy egységes és egyértelmű fogalomhasználatot biztosítson a **Petőfi Panzió** szoftverprojekt tervezésében, fejlesztésében, tesztelésében és dokumentációjában részt vevő összes szereplő (fejlesztők, megrendelők, tesztelők, oktatók/vizsgabizottság) számára.

---

## 2. Vendéglátóipari és Szállásadási Alapfogalmak

| Fogalom | Angol megfelelő | Definíció és kontextus |
| :--- | :--- | :--- |
| **Panzió (Szálláshely)** | *Guest house / Pension* | Olyan kereskedelmi szálláshely, amely meghatározott számú szobával, recepcióval és alapszolgáltatásokkal (pl. reggeli, parkoló) fogadja a vendégeket. |
| **Szoba / Lakóegység** | *Room / Unit* | A vendégek elszállásolására szolgáló önálló helyiség, amely meghatározott szobaszámmal, kapacitással és felszereltséggel bír. |
| **Szobatípus** | *Room Type* | A szobák kategóriája férőhely és komfortfokozat szerint (pl. Egyágyas, Kétágyas, Családi apartman, Prémium lakosztály). |
| **Férőhely (Kapacitás)** | *Capacity / Max Guests* | Az a maximális létszám, ahány személy az adott szobában rendeltetésszerűen elszállásolható (felnőtt és gyermek). |
| **Pótágy** | *Extra Bed* | Opcionálisan berakható kiegészítő fekhely, amely növelheti az alapférőhelyet (gyakran felár ellenében). |
| **Vendégéjszaka / Éj** | *Room Night* | A szállásdíj elszámolásának alapegysége; egy szoba egy éjszakára történő igénybevétele. |
| **Érkezés (Check-in)** | *Check-in* | Az a hivatalos időpont és adminisztrációs folyamat, amikor a vendég megérkezik, azonosítja magát a recepción, és átveszi a szobakulcsot (pl. 14:00-tól). |
| **Távozás (Check-out)** | *Check-out* | Az a határidő és folyamat, amikor a vendég elhagyja a szobát, rendezi az esetleges fennmaradó összeget és leadja a kulcsot (pl. 10:00-ig). |
| **IFA (Idegenforgalmi Adó)** | *City Tax / Tourist Tax* | Helyi önkormányzati adónem, amelyet a 18. életévüket betöltött vendégek fizetnek személyenként és éjszakánként a szállásdíj felett. |
| **Ellátás típusa** | *Board Type* | A szálláshoz választható étkezés: **RO** (Csak szállás / Room Only), **BB** (Szállás reggelivel / Bed & Breakfast), **HB** (Félpanzió / Half Board). |
| **Foglaló / Előleg** | *Deposit / Prepayment* | A foglalás megerősítéséhez kért pénzösszeg, amely a teljes szállásdíj meghatározott százaléka. |
| **No-show (Meg nem jelenés)** | *No-show* | Az a helyzet, amikor a vendég rendelkezik érvényes foglalással, de nem érkezik meg, és a foglalást nem mondta le időben. |
| **Házirend** | *House Rules* | A panzió belső működési és viselkedési szabályzata (pl. csendes pihenőidő, dohányzási tilalom, háziállatok szabályai). |

---

## 3. Rendszerbeli Szerepkörök és Jogosultságok

| Szerepkör | Megnevezés a kódban | Jogosultsági szint és felelősség |
| :--- | :--- | :--- |
| **Látogató** | `Guest (Anonymous)` | Nem bejelentkezett felhasználó. Megtekintheti a szobákat, árakat, szabad időpontokat, és elindíthatja a regisztrációt. |
| **Regisztrált Vendég** | `User (Authenticated)` | Bejelentkezett ügyfél. Foglalást kezdeményezhet, nyomon követheti korábbi és jövőbeli foglalásait, módosíthatja profilját. |
| **Recepciós** | `Staff / Receptionist` | Panziói személyzet. Hozzáférése van a foglalási naptárhoz, vendéglistához, be- és kijelentkeztetéshez, szobák takarítási státuszához. |
| **Adminisztrátor** | `Administrator` | Rendszergazda / Üzletvezető. Teljes körű hozzáférés a rendszerhez: szobák törzsadatainak kezelése, árazás, felhasználói fiókok és kimutatások. |

---

## 4. Állapotgépek és Életciklusok (Status Lifecycles)

### 4.1 Foglalás Státuszok (Booking Status)
A foglalások életciklusa a felviteltől a távozásig:

1. **`pending` (Függőben):** A vendég beküldte a foglalást, visszaigazolásra vagy előlegfizetésre vár.
2. **`confirmed` (Megerősítve):** A foglalás érvényes, a szoba zárolva van az adott időszakra.
3. **`checked_in` (Beköltözött / Vendég a házban):** A vendég megérkezett a panzióba, átvette a szobát.
4. **`checked_out` (Kijelentkezett / Lezárt):** A vendég elhagyta a szállást, a számlázás megtörtént.
5. **`cancelled` (Lemondva):** A foglalást a vendég vagy a személyzet törölte.

### 4.2 Szoba Státuszok (Room Status)
A szobák fizikai és takarítási állapota a recepción:

- **`available` (Szabad és tiszta):** Átadható az érkező vendégnek.
- **`occupied` (Foglalt):** Jelenleg lakott szoba.
- **`dirty` / `needs_cleaning` (Takarításra vár):** Távozott a vendég, a takarítás még nem fejeződött be.
- **`maintenance` (Karbantartás alatt):** Javítás, festés vagy műszaki hiba miatt ideiglenesen nem foglalható.

---

## 5. Adatbázis és Adatmodell Terminológia

A Petőfi Panzió relációs adatbázisának (`petofi_panzio`) fő entitásai és mezői:

### 5.1 Felhasználók és Vendégek (`users` / `guests`)
- `id`: Egyedi rekordazonosító (Primary Key)
- `firstname`: Vendég utóneve / keresztneve
- `lastname`: Vendég vezetékneve / családneve
- `email`: Egyedi elektronikus levelezési cím (egyben a bejelentkezési azonosító)
- `phone`: Elérhetőségi telefonszám (nemzetközi vagy hazai formátumban)
- `address`: Levelezési / lakcím (irányítószám, település, utca, házszám)
- `role`: Felhasználói szerepkör (`guest`, `receptionist`, `admin`)
- `created_at`: Regisztráció vagy létrehozás időbélyege

### 5.2 Szobák (`rooms`)
- `id`: Egyedi szobaazonosító
- `room_number`: Fizikai szobaszám (pl. 101, 102, 201)
- `name`: Szoba fantázianeve (pl. „Petőfi Lakosztály”, „Dunaparti Kétágyas”)
- `room_type_id`: Hivatkozás a szobatípusra (Foreign Key)
- `capacity`: Férőhelyek maximális száma (fő)
- `price_per_night`: Alapár egy éjszakára (HUF)
- `description`: Részletes leírás és felszereltség (pl. klíma, tv, zuhanyzó)
- `image_url`: Reprezentatív kép elérési útja
- `status`: Jelenlegi státusz (`available`, `occupied`, `maintenance`)

### 5.3 Foglalások (`bookings` / `reservations`)
- `id`: Egyedi foglalási azonosító
- `user_id`: A foglalást végző vendég azonosítója (Foreign Key -> `users.id`)
- `room_id`: A lefoglalt szoba azonosítója (Foreign Key -> `rooms.id`)
- `check_in_date`: Érkezési dátum
- `check_out_date`: Távozási dátum
- `number_of_guests`: Érkező személyek száma
- `total_price`: Teljes fizetendő összeg (szobaár + adók)
- `status`: Foglalás állapota (`pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled`)
- `special_requests`: Vendég által megadott különleges kérések, megjegyzések

---

## 6. Technológiai és Szoftverarchitektúra Fogalmak

- **Frontend:** A webalkalmazás felhasználói felülete, amellyel a látogató és az admin közvetlenül kapcsolatba lép a böngészőben.
- **Vue.js 3:** Modern, reaktív JavaScript keretrendszer a felhasználói felületek és egyoldalas webalkalmazások építésére.
- **Vite:** Következő generációs, rendkívül gyors fejlesztői kiszolgáló és kötegelő (build tool) a modern frontendekhez.
- **SPA (Single Page Application):** Egyoldalas webalkalmazás, ahol az oldal újratöltése nélkül, dinamikusan frissül a tartalom a böngészőben.
- **Komponens (Component):** Újrafelhasználható, önálló sablonból, logikából és stílusból álló felületi építőkocka (pl. `RoomCard.vue`, `BookingForm.vue`, `Navbar.vue`).
- **Reaktív Állapotkezelés (Reactivity):** A Vue beépített mechanizmusa (`ref`, `reactive`), amely biztosítja, hogy az adatok megváltozásakor a felhasználói felület automatikusan és azonnal frissüljön.
- **REST API:** Reprezentatív állapotátvitelen alapuló webszolgáltatás-architektúra, amelyen keresztül a Vue kliens és az adatbázis/backend kommunikál (GET, POST, PUT, DELETE HTTP kérésekkel).
- **CRUD Műveletek:** Az adatkezelés 4 alappillére:
  - **C**reate (Létrehozás – pl. új foglalás leadása)
  - **R**ead (Lekérdezés – pl. szobák listázása)
  - **U**pdate (Módosítás – pl. profil vagy foglalási státusz frissítése)
  - **D**elete (Törlés / Lemondás – pl. foglalás archiválása)
- **JSON (JavaScript Object Notation):** Könnyűsúlyú adatcserélő szöveges formátum a frontend és a backend között.
- **Reszponzív Webtervezés (RWD):** Olyan felületi kialakítás (CSS Media Query-k, Flexbox, Grid), amely automatikusan igazodik a képernyőmérethez (mobil, tablet, desktop).

---

## 7. Angol – Magyar Fejlesztői Szójegyzék (Code Mapping)

A kódbázisban és az adatbázisban használt elnevezések egységes megfeleltetése:

| Angol kifejezés a kódban | Magyar elnevezés | Jelentés / Szerep |
| :--- | :--- | :--- |
| `guest` | Vendég | Szállást igénybe vevő magánszemély |
| `room` | Szoba | Kiadható szállásegység |
| `booking` / `reservation` | Foglalás | Szoba lefoglalása adott időszakra |
| `check_in` / `check_out` | Érkezés / Távozás | Bejelentkezés és kijelentkezés időpontja |
| `price_per_night` | Éjszakánkénti ár | Alap szobaár egy éjre |
| `total_price` | Végösszeg | A teljes foglalási összeg |
| `capacity` | Férőhely | Maximális vendéglétszám |
| `amenities` / `facilities` | Felszereltség | A szobához tartozó extrák (WiFi, TV, klíma) |
| `deposit` | Előleg / Foglaló | Előre kifizetett összeg |
| `invoice` | Számla | Pénzügyi bizonylat a szolgáltatásról |
| `review` / `rating` | Értékelés | Vendég által adott vélemény és pontszám |
