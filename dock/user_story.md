# Petőfi Panzió – User Story Dokumentáció

## 1. Bevezetés és a Projekt Célja
A **Petőfi Panzió** egy modern, felhasználóbarát webes szállásfoglaló és panziókezelő szoftver. A rendszer célja, hogy egyszerű és átlátható felületet biztosítson a leendő vendégek számára a szobák böngészésére, a szabad időpontok keresésére és a szobafoglalásra, miközben a panzió munkatársai és vezetősége hatékonyan tudja kezelni a vendégadatokat, a szobastátuszokat és a foglalási folyamatokat.

---

## 2. Felhasználói Szerepkörök (Personas)

| Szerepkör | Megnevezés | Leírás |
| :--- | :--- | :--- |
| **ROLE_GUEST_ANON** | Látogató (Nem regisztrált) | Érdeklődő felhasználó, aki tájékozódik a panzió szolgáltatásairól, árairól, képeiről és elérhetőségéről. |
| **ROLE_GUEST_AUTH** | Regisztrált Vendég | Bejelentkezett felhasználó, aki szobát tud foglalni, megtekintheti korábbi és aktív foglalásait, és módosíthatja profiladatait. |
| **ROLE_RECEPTION** | Recepciós / Személyzet | A panzió operatív munkatársa, aki kezeli a napi be- és kijelentkezéseket, manuálisan rögzít foglalásokat és nyomon követi a szobák állapotát. |
| **ROLE_ADMIN** | Adminisztrátor / Tulajdonos | Teljes körű jogosultsággal rendelkező vezető, aki a szobakínálatot, árazást, felhasználói fiókokat és kimutatásokat kezeli. |

---

## 3. Prioritási Skála (MoSCoW Módszertan)
- **MUST (Must Have):** Alapvető funkciók, amelyek nélkül a rendszer működésképtelen (MVP szint).
- **SHOULD (Should Have):** Kiemelten fontos funkciók, de a rendszer nélkülük is elindítható ideiglenesen.
- **COULD (Could Have):** Kényelmi funkciók, amelyek növelik az élményt, de alacsonyabb prioritásúak.
- **WONT (Won't Have this time):** Jelen fejlesztési fázisban nem kerülnek implementálásra, későbbi bővítés tárgyai.

---

## 4. Részletes User Story-k (Epikák szerint)

### Epika 1: Szobakínálat és Információkeresés (Katalógus)

#### US-1.1: Szobakínálat böngészése
- **Mint** érdeklődő látogató,  
  **szeretném** áttekinteni a panzió összes elérhető szobáját kártyás elrendezésben,  
  **azért, hogy** lássam a szobák típusait, alapárait, férőhelyeit és képeit.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - A főoldalon és/vagy szobák oldalon megjelennek a szobák listája/kártyái.
  - Minden kártyán látható: szoba neve/típusa, férőhely (fő), alapár / éj, reprezentatív kép, és egy „Részletek” gomb.

#### US-1.2: Részletes szobaadatlap
- **Mint** vendég,  
  **szeretném** megtekinteni egy kiválasztott szoba részletes adatait,  
  **azért, hogy** pontos információt kapjak a felszereltségről (pl. klíma, wifi, erkély) és több képet is lássak róla.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - A szobára kattintva megnyílik a részletes nézet képgalériával.
  - Felsorolásra kerülnek a szoba szolgáltatásai (ikonokkal vagy listaként).
  - Megjelenik az árazás és a maximális férőhelyek száma.

#### US-1.3: Szabad szobák keresése dátum és létszám szerint
- **Mint** vendég,  
  **szeretném** megadni az érkezés és távozás napját, valamint a vendégek számát,  
  **azért, hogy** a rendszer csak a kiválasztott intervallumban szabad és a létszámnak megfelelő szobákat jelenítse meg.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - Érvénytelen dátumtartomány (pl. távozás korábbi, mint érkezés, vagy múltbeli dátum) esetén hibaüzenet jelenik meg.
  - A szűrés gombra kattintva a lista dinamikusan frissül a szabad kapacitásra.
  - Amennyiben nincs szabad szoba, egyértelmű tájékoztató üzenet jelenik meg.

---

### Epika 2: Felhasználói Fiókok és Hitelesítés (Auth)

#### US-2.1: Vendég regisztráció
- **Mint** új látogató,  
  **szeretnék** regisztrálni egy fiókot a nevem, email címem, telefonszámom és lakcímem megadásával,  
  **azért, hogy** gyorsabban és kényelmesebben foglalhassak, valamint nyomon követhessem a foglalásaimat.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - Megadandó mezők: vezetéknév, keresztnév, email cím, telefonszám, lakcím, jelszó (kétszer).
  - Az email cím egyediségének ellenőrzése megtörténik (már regisztrált email esetén figyelmeztetés).
  - Sikeres regisztráció után visszajelzést kap a felhasználó és átirányításra kerül a bejelentkezéshez vagy közvetlenül belép.

#### US-2.2: Bejelentkezés és Kijelentkezés
- **Mint** regisztrált felhasználó,  
  **szeretnék** bejelentkezni az email címemmel és a jelszavammal,  
  **azért, hogy** hozzáférjek a zárt funkciókhoz és a fiókomhoz.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - Helytelen adatok esetén informatív hibaüzenet (pl. "Hibás felhasználónév vagy jelszó").
  - Sikeres belépéskor a fejléc átvált (megjelenik a felhasználó neve, profil linkje és Kijelentkezés gomb).
  - Kijelentkezéskor a munkamenet azonnal törlődik.

#### US-2.3: Profiladatok kezelése
- **Mint** regisztrált vendég,  
  **szeretném** megtekinteni és módosítani a megadott adataimat (pl. telefonszám, cím),  
  **azért, hogy** a szállásadó a helyes és aktuális elérhetőségeimen érhessen el.
- **Prioritás:** SHOULD
- **Elfogadási kritériumok:**
  - A profil oldalon az űrlap a meglévő adatokkal feltöltve nyílik meg.
  - Módosítás után a mentés gomb frissíti az adatbázis rekordot és sikeres visszajelzést ad.

---

### Epika 3: Szobafoglalási Folyamat (Booking)

#### US-3.1: Szobafoglalás összeállítása és elküldése
- **Mint** bejelentkezett vendég,  
  **szeretném** lefoglalni egy kiválasztott szobát az általam kívánt dátumokra,  
  **azért, hogy** biztosítsam a szállásomat a megadott időszakra.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - A foglalási űrlapon ki kell választani az érkezési és távozási dátumot, valamint a vendégek számát.
  - A rendszer ellenőrzi a szoba ütközését meglévő foglalásokkal.
  - Megjelenik az összegző: éjszakák száma, teljes összeg, szoba megnevezése.
  - A foglalás elküldése után a státusz "Függőben" (Pending) vagy "Megerősített" (Confirmed) állapotba kerül.

#### US-3.2: Automatikus árkalkuláció és IFA számítás
- **Mint** foglalást leadó vendég,  
  **szeretném** valós időben látni a foglalás várható végösszegét az éjszakák száma és az idegenforgalmi adó (IFA) alapján lebontva,  
  **azért, hogy** tisztában legyek a fizetendő költségekkel még a véglegesítés előtt.
- **Prioritás:** SHOULD
- **Elfogadási kritériumok:**
  - Dátumválasztáskor az ár automatikusan újraszámolódik: `(éjszakák száma * szoba ára) + opcionális díjak`.
  - A kalkuláció átláthatóan listázza a tételeket.

#### US-3.3: Megjegyzés és különleges kérések hozzáadása
- **Mint** vendég,  
  **szeretném** megjegyzést írni a foglaláshoz (pl. késői érkezés, babaágy igény),  
  **azért, hogy** a panzió személyzete előre fel tudjon készülni az egyedi igényeimre.
- **Prioritás:** COULD
- **Elfogadási kritériumok:**
  - Szöveges megjegyzés mező elérhető a foglalási űrlapon.
  - A megadott üzenet mentésre kerül a foglalás mellé, amit a recepciós láthat.

---

### Epika 4: Vendég Saját Fiók és Foglaláskövetés

#### US-4.1: Saját foglalások előzményeinek megtekintése
- **Mint** regisztrált vendég,  
  **szeretném** egy listában látni a jövőbeli, valamint a már lezárult korábbi foglalásaimat,  
  **azért, hogy** tájékozódhassak a részletekről (dátumok, szoba, fizetendő összeg, státusz).
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - A "Saját foglalásaim" menüpont alatt kártyás vagy táblázatos formában megjelennek a vendég rekordjai.
  - Jól megkülönböztethető a foglalások állapota (pl. Függőben, Megerősítve, Lemondva, Befejezve).

#### US-4.2: Foglalás lemondása a vendég által
- **Mint** regisztrált vendég,  
  **szeretném** önállóan lemondani a jövőbeli foglalásomat a felületről,  
  **azért, hogy** ne kelljen telefonon egyeztetnem, ha közbejött valami.
- **Prioritás:** SHOULD
- **Elfogadási kritériumok:**
  - Csak a még nem megkezdett (jövőbeli) foglalások mellett jelenik meg a "Foglalás lemondása" gomb.
  - Megerősítő felugró ablak kéri a lemondás jóváhagyását.
  - Jóváhagyás után a foglalás státusza "Lemondva" állapotra vált, és a szoba azonnal újra szabaddá válik másoknak.

---

### Epika 5: Recepció és Napi Működés (Front Desk)

#### US-5.1: Foglalási összesítő naptár és táblázat
- **Mint** panzió recepciós,  
  **szeretném** naptárban vagy időrendi táblázatban látni a szobák foglaltságát,  
  **azért, hogy** átlássam, melyik szobába mikor érkeznek vendégek, és mikor van üresedés.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - Szűrhető nézet dátumintervallum és szobák szerint.
  - Egy pillantásra látható, hogy mely szoba foglalt, és melyik szabad.

#### US-5.2: Helyszíni / telefonos manuális foglalás rögzítése
- **Mint** recepciós,  
  **szeretném** új foglalást felvenni a recepción telefonáló vagy személyesen betérő vendég nevében,  
  **azért, hogy** az online rendszeren kívüli foglalások is bekerüljenek a központi nyilvántartásba.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - A recepciós kiválaszthat meglévő vendéget vagy újat rögzíthet (név, telefon, email).
  - A lefoglalt szoba a kiválasztott időpontra azonnal zárolásra kerül a publikus látogatók elől.

#### US-5.3: Vendég érkeztetése és távoztatása (Check-in / Check-out)
- **Mint** recepciós,  
  **szeretném** egy gombnyomással bejelentkeztetni (Check-in) az érkező vendéget és kijelentkeztetni (Check-out) a távozót,  
  **azért, hogy** pontosan tudjuk, jelenleg kik tartózkodnak a panzióban.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - A státusz állítható: "Foglalt" -> "Beköltözött / Check-in" -> "Távozott / Check-out".
  - Kijelentkezés után a szoba állapota automatikusan "Takarításra vár" megjelölést kap.

#### US-5.4: Szobák állapotának kezelése (Takarítás / Karbantartás)
- **Mint** személyzet,  
  **szeretném** látni és módosítani a szobák tisztasági állapotát (pl. Tiszta, Takarítás alatt, Karbantartásra szorul),  
  **azért, hogy** csak kitakarított és felkészített szobát adhassunk át új vendégnek.
- **Prioritás:** SHOULD
- **Elfogadási kritériumok:**
  - Recepciós felületen minden szobához tartozik egy státuszválasztó.
  - A státusz azonnal frissül a felületen és az adatbázisban.

---

### Epika 6: Törzsadatok és Rendszeradminisztráció (Admin)

#### US-6.1: Szobák kezelése (CRUD)
- **Mint** adminisztrátor,  
  **szeretném** új szobákat felvenni, a meglévőket szerkeszteni vagy törölni,  
  **azért, hogy** a kínálat mindig a valós szobakapacitást tükrözze.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - Űrlap új szobához: szobaszám, név, típus, leírás, férőhelyek, alapár, képek.
  - Szerkesztési és archiválási / törlési lehetőség megerősítéssel.
  - Nem törölhető olyan szoba, amelyhez aktív jövőbeli foglalás tartozik.

#### US-6.2: Vendégadatok kezelése és exportálása
- **Mint** adminisztrátor,  
  **szeretném** áttekinteni a regisztrált felhasználók és vendégek listáját, valamint keresni név, email vagy telefonszám alapján,  
  **azért, hogy** szükség esetén felvehessem velük a kapcsolatot vagy ellenőrizhessem az adataikat.
- **Prioritás:** MUST
- **Elfogadási kritériumok:**
  - Kereshető, lapozható vendégtáblázat (`users` tábla).
  - Vendégprofil megtekintése az összes hozzá tartozó korábbi foglalással.

---

### Epika 7: Visszajelzések és Riportok

#### US-7.1: Vendégértékelés leadása
- **Mint** távozott vendég,  
  **szeretném** szöveges értékelést és 1-5 csillagos értékelést hagyni a tartózkodásomról,  
  **azért, hogy** megosszam a tapasztalataimat más érdeklődőkkel.
- **Prioritás:** COULD
- **Elfogadási kritériumok:**
  - Értékelést csak lezárt (Check-out megtörtént) foglaláshoz lehet írni.
  - Az értékelések a szoba adatlapon megjelennek.

#### US-7.2: Alapvető forgalmi kimutatások
- **Mint** panzióvezető,  
  **szeretném** látni az adott hónap foglalásainak számát, a bevételt és a szobakihasználtsági százalékot,  
  **azért, hogy** üzleti döntéseket hozhassak az árazásról és marketingről.
- **Prioritás:** COULD
- **Elfogadási kritériumok:**
  - Admin dashboardon összegző kártyák: Havi összes foglalás, Várható és realizált bevétel, Legnépszerűbb szobatípus.

---

## 5. Nem-Funkcionális Követelmények (NFR)

1. **Reszponzivitás és Eszközfüggetlenség:**
   - A felületnek zökkenőmentesen kell működnie okostelefonon (360px+), tableten és asztali monitoron (1920px).
2. **Teljesítmény és Válaszidő:**
   - A szobakeresési műveletek válaszideje nem haladhatja meg a 2 másodpercet normál terhelés mellett.
3. **Biztonság és Adatvédelem (GDPR):**
   - A felhasználói jelszavakat szigorúan titkosítva (pl. bcrypt hash) kell tárolni az adatbázisban.
   - Személyes adatokhoz (telefonszám, lakcím) csak az adott vendég és a jogosult személyzet férhet hozzá.
4. **Megbízhatóság és Adatintegritás:**
   - Tranzakciókezelés a foglalásnál a túlkönyvelés (dupla foglalás ugyanarra a szobára és időpontra) elkerülése érdekében.
