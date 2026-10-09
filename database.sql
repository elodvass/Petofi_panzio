-- ==========================================================
-- Petőfi Panzió - Adatbázis séma és tesztadatok (Dummy data)
-- ==========================================================

-- Adatbázis létrehozása (amennyiben még nem létezik)
CREATE DATABASE IF NOT EXISTS `petofi_panzio`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_hungarian_ci;

USE `petofi_panzio`;

-- Tábla eldobása, ha már létezik
DROP TABLE IF EXISTS `users`;

-- Felhasználók / Vendégek tábla létrehozása
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `firstname` VARCHAR(50) NOT NULL,
    `lastname` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone` VARCHAR(30) DEFAULT NULL,
    `address` VARCHAR(100) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- 20 darab tesztadat (Dummy data) beszúrása
INSERT INTO `users` (`firstname`, `lastname`, `email`, `phone`, `address`) VALUES
('Bence', 'Kovács', 'kovacs.bence@example.com', '+36 20 123 4567', 'Budapest, Kossuth Lajos u. 12.'),
('Anna', 'Nagy', 'nagy.anna@example.com', '+36 30 234 5678', 'Debrecen, Piac u. 45.'),
('Péter', 'Szabó', 'szabo.peter@example.com', '+36 70 345 6789', 'Szeged, Tisza Lajos krt. 18.'),
('Eszter', 'Tóth', 'toth.eszter@example.com', '+36 20 456 7890', 'Miskolc, Széchenyi u. 8.'),
('Dániel', 'Varga', 'varga.daniel@example.com', '+36 30 567 8901', 'Pécs, Király u. 22.'),
('Zsófia', 'Kiss', 'kiss.zsofia@example.com', '+36 70 678 9012', 'Győr, Baross Gábor út 5.'),
('Tamás', 'Molnár', 'molnar.tamas@example.com', '+36 20 789 0123', 'Kecskemét, Rákóczi út 14.'),
('Dóra', 'Németh', 'nemeth.dora@example.com', '+36 30 890 1234', 'Székesfehérvár, Várkörút 3.'),
('Balázs', 'Farkas', 'farkas.balazs@example.com', '+36 70 901 2345', 'Szombathely, Fő tér 9.'),
('Boglárka', 'Balogh', 'balogh.boglarka@example.com', '+36 20 012 3456', 'Nyíregyháza, Dózsa György út 11.'),
('Máté', 'Papp', 'papp.mate@example.com', '+36 30 112 2334', 'Szolnok, Jubileum tér 2.'),
('Lili', 'Takács', 'takacs.lili@example.com', '+36 70 223 3445', 'Tatabánya, Fő tér 6.'),
('Gergő', 'Juhász', 'juhasz.gergo@example.com', '+36 20 334 4556', 'Kaposvár, Fő utca 15.'),
('Viktória', 'Mészáros', 'meszaros.viktoria@example.com', '+36 30 445 5667', 'Békéscsaba, Andrássy út 28.'),
('Zoltán', 'Simon', 'simon.zoltan@example.com', '+36 70 556 6778', 'Veszprém, Óváros tér 4.'),
('Réka', 'Fekete', 'fekete.reka@example.com', '+36 20 667 7889', 'Eger, Dobó István tér 1.'),
('Ádám', 'Horváth', 'horvath.adam@example.com', '+36 30 778 8990', 'Zalaegerszeg, Kazinczy tér 7.'),
('Előd', 'Vass', 'vass.elod@example.com', '+36 70 889 9001', 'Sopron, Várkerület 19.'),
('Vivien', 'Szilágyi', 'szilagyi.vivien@example.com', '+36 20 990 0112', 'Nagykanizsa, Erzsébet tér 3.'),
('László', 'Dénes', 'denes.laszlo@example.com', '+36 30 135 7924', 'Salgótarján, Rákóczi út 36.');

-- Vendégek nézet (opcionális alias, ha a backend 'guests' néven hivatkozna rá)
CREATE OR REPLACE VIEW `guests` AS SELECT * FROM `users`;
