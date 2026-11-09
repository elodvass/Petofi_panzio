# User Story

## Jogosultságok áttekintése

| Funkció | Vendég | Dolgozó | Admin |
| --- | :---: | :---: | :---: |
| Szobák megtekintése | ✅ | ❌ | ✅ |
| Szoba és dátum kiválasztása | ✅ | ❌ | ✅ |
| Étkezés és menü kiválasztása | ✅ | ❌ | ✅ |
| Szobafoglalás rögzítése | ✅ | ❌ | ✅ |
| Aznapi étkezési igények és rendelések lekérdezése | ❌ | ✅ | ✅ |
| Szobákhoz tartozó menük és adagok megtekintése | ❌ | ✅ | ✅ |
| Ételek állapotának rögzítése (elkészült / kiadva) | ❌ | ✅ | ✅ |
| Szobák hozzáadása, módosítása és törlése | ❌ | ❌ | ✅ |
| Napi menü és étlap beállítása, módosítása | ❌ | ❌ | ✅ |
| Összes beérkezett foglalás megtekintése | ❌ | ❌ | ✅ |
| Foglalások és felhasználók törlése | ❌ | ❌ | ✅ |

## Vendég – profil

* A felhasználó regisztrál
* A felhasználó bejelentkezik
* A felhasználó belép a szobakeresésbe
* A felhasználó kiválaszt egy szobát és megadja a dátumot
* A felhasználó opcionálisan választhat hozzá étkezést (reggeli, ebéd, vacsora)
* A felhasználó lefoglalja a szobát (elmentődik az adatbázisba)

---

## Dolgozó – profil

* A felhasználó bejelentkezik
* A felhasználó megnézi az aznapi étkezési igényeket és rendeléseket
* A felhasználó látja, hogy melyik menüből mennyi kell a szobákhoz
* A felhasználó látja a szobák állapotát
* A felhasználó bejelöli, ha egy étel elkészült vagy kiadták
* A felhasználó bejelöli, ha elkezdte vagy befejezte a takarítást

---

## Admin – profil

* A felhasználó bejelentkezik
* A felhasználó hozzáad, módosít vagy töröl egy szobát
* A felhasználó beállítja a napi menüt
* A felhasználó megnézi az összes beérkezett foglalást
* A felhasználó törölhet egy foglalást vagy egy felhasználót
* A felhasználó kimutatásokat is kérhet le a lekérdezés oldalon