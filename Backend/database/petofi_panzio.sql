-- Petőfi Panzió Adatbázis Séma és Mintaadatok

CREATE DATABASE IF NOT EXISTS `petofi_panzio`
CHARACTER SET utf8mb4
COLLATE utf8mb4_hungarian_ci;

USE `petofi_panzio`;

-- 1. Felhasználók tábla
CREATE TABLE IF NOT EXISTS `felhasznalok` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nev` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `jelszo` VARCHAR(255) NOT NULL,
    `szerepkor` ENUM('vendeg', 'dolgozo', 'admin') DEFAULT 'vendeg',
    `letrehozva` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Szobák tábla
CREATE TABLE IF NOT EXISTS `szobak` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `szobaszam` VARCHAR(10) NOT NULL UNIQUE,
    `ferohely` INT NOT NULL,
    `ar_per_ej` INT NOT NULL,
    `leiras` TEXT NULL,
    `allapot` ENUM('szabad', 'foglalt', 'takaritas_alatt') DEFAULT 'szabad'
);

-- 3. Foglalások tábla
CREATE TABLE IF NOT EXISTS `foglalasok` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `felhasznalo_id` INT NOT NULL,
    `szoba_id` INT NOT NULL,
    `erkezes_datum` DATE NOT NULL,
    `tavozas_datum` DATE NOT NULL,
    `vendegek_szama` INT NOT NULL,
    `statusz` ENUM('fuggoben', 'megerositve', 'lemondva') DEFAULT 'fuggoben',
    `letrehozva` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`szoba_id`) REFERENCES `szobak`(`id`) ON DELETE CASCADE
);

-- 4. Ételek és Menük tábla
CREATE TABLE IF NOT EXISTS `etelek` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nev` VARCHAR(150) NOT NULL,
    `kategoria` ENUM('reggeli', 'ebed', 'vacsora') NOT NULL,
    `leiras` TEXT NULL,
    `ar` INT NOT NULL
);

-- 5. Étkezési rendelések tábla
CREATE TABLE IF NOT EXISTS `etkezesi_rendelesek` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `foglalas_id` INT NOT NULL,
    `datum` DATE NOT NULL,
    `etel_id` INT NOT NULL,
    `adag` INT NOT NULL DEFAULT 1,
    `statusz` ENUM('keszuloben', 'elkeszult', 'kiadva') DEFAULT 'keszuloben',
    FOREIGN KEY (`foglalas_id`) REFERENCES `foglalasok`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`etel_id`) REFERENCES `etelek`(`id`) ON DELETE CASCADE
);

-- Mintaadatok (opcionális alapadatok)
INSERT INTO `szobak` (`szobaszam`, `ferohely`, `ar_per_ej`, `leiras`) VALUES
('101', 2, 18000, 'Kétágyas standard szoba udvari kilátással'),
('102', 3, 24000, 'Háromágyas szoba erkéllyel'),
('201', 4, 32000, 'Családi lakosztály panorámás kilátással');

INSERT INTO `etelek` (`nev`, `kategoria`, `leiras`, `ar`) VALUES
('Kontinentális reggeli', 'reggeli', 'Pékáru, vaj, lekvár, sonka, sajt, tea/kávé', 2500),
('A menü - Húsleves, Rántott szelet rizzsel', 'ebed', 'Hagyományos vasárnapi ebéd menü', 3800),
('B menü - Gulyásleves, Túrógombóc', 'ebed', 'Magyaros menü', 3500),
('Hidegtál', 'vacsora', 'Helyi sajtok, sonkák, friss zöldségek és kenyér', 3000);

