-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: database:3306
-- Generation Time: Jun 15, 2026 at 12:42 PM
-- Server version: 10.6.25-MariaDB-ubu2204
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webshop`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `address_id` int(11) NOT NULL,
  `fk_user_id` int(11) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`address_id`, `fk_user_id`, `postal_code`, `address`, `city`, `country`, `created_at`) VALUES
(6, 16, '1111', 'Jakob Str. 1', 'Vienna', 'Austria', '2026-04-25 10:33:01'),
(7, 17, '1100', 'eine adresse 15', 'Vienna', 'Austria', '2026-05-29 18:17:29'),
(9, 20, '2010', 'Strasse der Beate 20', 'Bratislava', 'Slovakia', '2026-06-15 08:32:09'),
(16, 32, '3020', 'Musterstraße 42', 'Regensburg', 'Germany', '2026-06-15 09:17:10'),
(17, 33, '1941', 'Tabeas Strasse 12', 'Nove Zamky', 'Slovakia', '2026-06-15 09:21:06');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` int(11) NOT NULL,
  `fk_user_id` int(11) NOT NULL,
  `fk_product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`) VALUES
(1, 'Graphics cards'),
(2, 'Cases'),
(3, 'Coolers'),
(4, 'RAM'),
(5, 'Power Supplies'),
(6, 'Fans'),
(7, 'Motherboards'),
(8, 'Storage');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `fk_user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `fk_user_id`, `total_amount`, `status`, `created_at`) VALUES
(9, 17, 998.00, 'pending', '2026-06-01 09:36:29'),
(18, 17, 1225.29, 'pending', '2026-06-13 12:31:41'),
(19, 17, 204.50, 'shipped', '2026-06-14 15:38:13'),
(20, 33, 896.23, 'pending', '2026-06-15 09:22:00'),
(21, 33, 709.31, 'pending', '2026-06-15 09:22:34'),
(22, 32, 852.64, 'pending', '2026-06-15 09:23:13');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `fk_order_id` int(11) NOT NULL,
  `fk_product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `fk_order_id`, `fk_product_id`, `quantity`, `price`) VALUES
(20, 18, 16, 2, 199.99),
(21, 18, 20, 1, 336.99),
(22, 18, 24, 1, 35.33),
(23, 18, 26, 1, 353.00),
(24, 18, 21, 1, 99.99),
(26, 19, 17, 1, 204.50),
(27, 20, 18, 2, 322.68),
(28, 20, 25, 1, 115.87),
(29, 20, 2, 1, 135.00),
(30, 21, 24, 1, 35.33),
(31, 21, 20, 2, 336.99),
(32, 22, 21, 2, 99.99),
(33, 22, 15, 1, 129.99),
(34, 22, 18, 1, 322.68),
(35, 22, 16, 1, 199.99);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `avg_rating` decimal(2,1) DEFAULT 0.0,
  `total_ratings_count` int(11) DEFAULT 0,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL,
  `fk_category_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `description`, `avg_rating`, `total_ratings_count`, `price`, `stock_quantity`, `fk_category_id`, `created_at`) VALUES
(1, 'GeForce RTX™ 5080 16G VANGUARD', '#### Core Clocks:\r\n- **Extreme Performance:**  2745 MHz (MSI Center)\r\n\r\n- **Boost:** 2730 MHz (GAMING & SILENT Mode)\r\n\r\n- **HYPER FROZR THERMAL DESIGN:** An apex evolution of advanced thermal design that delivers unparalleled cooling and quiet operation.\r\n\r\n- **STORMFORCE Fan:** Seven fan blades, claw texturing, and a circular arc are designed for optimal airflow with minimal noise. \r\n\r\n- **Advanced Vapor Chamber:**\r\nBuilt-in Vapor Chamber swiftly transfers heat from the GPU and VRAM to the core pipe for optimal dissipation. \r\n\r\n- **Core Pipes:** Square-shaped Core Pipes maximize heat dissipation with the Vapor Chamber for superior cooling.\r\n\r\n- **Filled Fins:** Shaped fins cover the core pipes to reduce turbulence and enhance cooling performance.\r\n\r\n- **Wave Curved 4.0:** Precision-engineered wave edges with a high-low fin design enhance airflow and reduce turbulence.\r\n\r\n- **Air Antegrade Fin 2.0:** The fins feature a V-shaped cutout and a high-low design at the airflow passthrough to optimize flow efficiency.\r\n\r\n- **Metal Backplate:** A reinforcing metal backplate with airflow vents and thermal pads enhances cooling.\r\n\r\n- **Dual BIOS**: Dual BIOS gives you the choice to prioritize for full performance in GAMING mode or low noise in SILENT mode.\r\n- **MSI Center:** The exclusive MSI Center software lets you monitor, tweak and optimize MSI products in real-time.\r\n- **Afterburner:** Take full control with the most recognized and widely used graphics card overclocking software in the world.', 4.8, 10, 499.00, 20, 1, '2026-06-13 10:40:41'),
(2, 'Radeon RX7900-XTX trio classic 24G', '#### TRI FROZR 2 Thermal Design\r\n\r\n**TORX Fan 4.0:** A masterpiece of teamwork, fan blades work in pairs to create unprecedented levels of focused air pressure.\r\n\r\n**Core Pipe:** Precision-crafted heat pipes ensure max contact to the GPU and spread heat along the full length of the heatsink.\r\n\r\n**Airflow Control:** Don\'t sweat it, Airflow Control guides the air to exactly where it needs to be for maximum cooling.\r\n\r\n**RGB Mystic Light:** Mystic Light gives you complete control of the RGB lighting for MSI devices and compatible RGB products.\r\n\r\n**MSI Center:** MSI\'s exclusive MSI Center software lets you monitor, tweak and optimize MSI products in real-time.\r\n\r\n', 2.2, 10, 135.00, 20, 1, '2026-04-25 11:52:44'),
(15, 'FRAME 4500X RS-R ARGB Panoramic Glass - White', '- Single-piece **curved glass** front and side panel\r\n- **InfiniRail™** Fan Mounting System for easier building\r\n- Dual 360mm radiator support\r\n- 3x RS-R ARGB **120mm** reverse-rotor fans\r\n- Easy motherboard RGB control with bundled ARGB PWM fans\r\n- GPU **Anti-sag** Stabilization Arm\r\n- Compatible with reverse connector motherboards', 4.1, 12, 129.99, 17, 2, '2026-06-13 11:25:37'),
(16, 'FRAME 4000D Vault Mid-Tower PC Case – Galaxy', '- **Chromatic paint** that shifts color with viewing angle and lighting\r\n- Aluminum badge with **limited edition etching**, only 1337 of each color made\r\n- Full-Tempered **Glass Side Panel** and Compact PSU Shroud\r\n- Modern Front I/O panel with **3x USB Type-C** ports\r\n- **InfiniRail™** Fan Mounting System for easier building\r\n- Dual 360mm radiator support\r\n- GPU **Anti-sag** Stabilization Arm\r\n- Compatible with reverse connector motherboards including ASUS BTF, MSI PROJECT ZERO, and GIGABYTE PROJECT STEALTH\r\n', 5.0, 24, 199.99, 7, 2, '2026-06-13 11:25:37'),
(17, 'iCUE LINK H100i LCD Liquid CPU Cooler', 'A powerful **all-in-one** CPU cooler with an ultra-bright 2.1\" IPS LCD screen, leveraging **revolutionary iCUE LINK technology** for easier, faster, and cleaner building than ever before.\r\n\r\n- **240mm Radiator** with QX120 RGB fans spinning up to 2,400 RPM\r\n\r\n- **Customizable LCD screen** showcases system temps, images, and animated GIFs\r\n- Copper cold plate compatible with latest Intel 1700 & AMD AM5 sockets\r\n- iCUE LINK System Hub included to connect up to 24 devices\r\n- **Six-year** warranty\r\n', 3.9, 40, 204.50, 30, 3, '2026-06-13 11:33:24'),
(18, 'iCUE LINK H150i RGB AIO Liquid CPU Cooler - White', 'A powerful **all-in-one** CPU cooler leveraging revolutionary iCUE LINK technology for easier, faster, and cleaner building than ever before.\r\n\r\n**360mm Radiator** with QX120 RGB fans spinning up to 2,400 RPM\r\n**Copper cold plate** compatible with latest Intel 1700 & AMD AM5 sockets\r\niCUE LINK System Hub included to **connect up to 24 devices**\r\n**Six-year** warranty\r\n', 4.6, 0, 322.68, 14, 3, '2026-06-13 11:33:24'),
(19, 'VENGEANCE® 64GB (2x32GB) DDR5', '**DR5 DRAM with up to 6000MT/s CL30 AMD EXPO & Intel XMP Memory Kit**\r\n\r\n- Delivers the higher frequencies and greater capacities of DDR5 RAM technology\r\nhigh-quality\r\n- Compact DDR5 memory module that suits your **AMD® Ryzen™ AM5 system**', 4.8, 33, 1163.00, 21, 4, '2026-06-13 11:41:32'),
(20, 'VENGEANCE® RGB PRO 32GB (2 x 16GB) DDR4', '**DDR4 DRAM Up To 3600MHz C18 AMD Ryzen Memory Kit — Black**\r\n- **CORSAIR VENGEANCE RGB PRO Series DDR4** overclocked memory lights up your PC with mesmerizing dynamic **multi-zone RGB lighting**\r\n- delivers the best in DDR4 performance.', 4.6, 0, 336.99, 12, 4, '2026-06-13 11:41:32'),
(21, 'RMx Series™ RM1000x — 1000 Watt 80 PLUS', '**Fully Modular ATX PSU (EU)**\r\n- CORSAIR RM1000x Series fully modular power supply\r\n- EPS12V connectors\r\n- delivers 80 PLUS Gold efficient power to your PC, with **virtually silent** operation.', 1.5, 4, 99.99, 22, 5, '2026-06-13 12:13:58'),
(22, 'CX Series™ CX550F RGB — 550 Watt 80 Plus® Bronze', '**Certified Fully Modular RGB PSU (WW)**\r\n- CORSAIR CX-550F RGB Series fully modular power supply \r\n- delivers reliable **80 PLUS Bronze efficient power** to your system\r\n- vibrant **customizable lighting** from a 120mm RGB fan and a clean aesthetic.', 2.7, 11, 150.60, 10, 5, '2026-06-13 12:13:58'),
(23, 'iCUE ML140 RGB 140mm PWM Magnetic Levitation Fan', '- White Dual Fan Kit with iCUE Lighting Node CORE\r\n- The CORSAIR iCUE ML140 RGB **ELITE Premium 140mm** PWM Magnetic Levitation Dual Fan Kit \r\n- White Frame boasts CORSAIR AirGuide technology and magnetic levitation bearings for **low noise and high cooling performance**\r\n', 4.2, 20, 68.80, 16, 6, '2026-06-13 12:21:20'),
(24, 'RS120 ARGB 120mm PWM Fans - Triple Pack', '- Daisy-chained **4-pin PWM connectors**\r\n- Daisy-chained **+5V ARGB lighting** with eight LEDs per fan\r\n- CORSAIR AirGuide technology for **concentrated airflow**\r\n- CORSAIR Magnetic Dome bearing for **longevity and low noise**\r\n- **Zero RPM mode** at low loads', 4.6, 18, 35.33, 47, 6, '2026-06-13 12:21:20'),
(25, 'MSI B840M GAMING PLUS WIFI6E AM5 mATX Motherboard', '- **Processor Support:** Compatible with AMD Ryzen™ 9000/8000/7000 processors (Socket AM5).\r\n\r\n- **Memory:** Supports DDR5 memory, dual-channel DDR5 up to 8000+ MT/s (OC).\r\n\r\n- **Cooling:** Equipped with Frozr Guard, extended heatsinks, MOSFET and choke thermal pads, and EZ M.2 Shield Frozr II for optimal heat dissipation.\r\n\r\n- **Networking:** Full speed with Wi-Fi 7 and 2.5G LAN for reliable and fast connections.\r\n\r\n- **Performance Design:** 7+2+1 phase Direct CPU Power and Core Boost for stable and high performance.\r\n\r\n- **Storage & Expansion:** PCIe 4.0 slot, two Lightning Gen 4 x4 M.2 slots, and 4x SATA 6G.\r\n\r\n- **Connectivity:** Numerous USB ports, including front and rear USB Type-C (up to 10Gbps).\r\n\r\n- **DIY-friendly:** Features like EZ M.2 Clip II, EZ PCIe Clip II, and EZ Antenna simplify installation.\r\n\r\n- **Audio:** Audio Boost with Realtek ALC897 7.1-channel High Definition Audio for an immersive sound experience.\r\n\r\n- **Form factor:** ATX.', 4.3, 5, 115.87, 27, 7, '2026-06-13 12:28:48'),
(26, 'MAG Z890 TOMAHAWK WIFI II', '- stable, durable and **DIY friendly** foundation for custom PC builds\r\n- **Wi-Fi 7** solution and Intel Killer 5G LAN\r\n- Thunderbolt 4\r\n- PCIe 5.0 solutions \r\n- with **Supplemental PCIe Power** and exclusive EZ DIY features, it\'s ready for the battlefield of Intel Core Ultra processors\r\n', 4.1, 8, 353.00, 14, 7, '2026-06-13 12:28:48');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `image_id` int(11) NOT NULL,
  `fk_product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`image_id`, `fk_product_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`) VALUES
(1, 1, '/backend/product-pictures/gpu/RTX-5080-16g-vanguard-msi.png', 'RTX-5080 16GB graphics card', 0, 1, '2026-04-26 10:04:02'),
(2, 2, '/backend/product-pictures/gpu\\radeon-rx7900-xtx-gaming-trio-classic-24g.png\r\n\r\n', 'Radeon RX 7900-XTX graphics card', 0, 0, '2026-04-26 10:38:01'),
(3, 16, '/backend/product-pictures/cases/frame-4000D-vault-galaxy.png\r\n\r\n', 'FRAME 4000D Vault Mid-Tower PC Case - Galaxy 16', 0, 0, '2026-06-13 11:28:25'),
(4, 15, '/backend/product-pictures/cases/case-white-3500x.png', 'FRAME 4500X RS-R ARGB Panoramic Glass - White', 0, 0, '2026-06-13 11:28:25'),
(5, 17, '/backend/product-pictures/coolers/icue-link-h100i-lcd-liquid-cooler.png', 'iCUE LINK H100i LCD Liquid CPU Cooler - Black', 0, 0, '2026-06-13 11:35:05'),
(6, 18, '/backend/product-pictures/coolers/icue-link-h150i-aio-liquid-cooler-white.png', 'iCUE LINK H150i RGB AIO Liquid CPU Cooler - White', 0, 0, '2026-06-13 11:35:05'),
(7, 19, '/backend/product-pictures/ram/vengeance-64gb-ddr5-blk.png', 'VENGEANCE® 64GB (2x32GB) DDR5 DRAM with up to 6000MT/s CL30 AMD EXPO & Intel XMP Memory Kit', 0, 0, '2026-06-13 11:42:42'),
(8, 20, '/backend/product-pictures/ram/vengeance-rgb-pro-32gb-ddr4-blk.png', 'VENGEANCE® RGB PRO 32GB (2 x 16GB) DDR4 DRAM Up To 3600MHz C18 AMD Ryzen Memory Kit — Black', 0, 0, '2026-06-13 11:42:42'),
(9, 22, '/backend/product-pictures/power-supply/CX-series-CX550F-RGB-550-Watt-80-Plus.png', 'CX Series™ CX550F RGB — 550 Watt 80 Plus® Bronze Certified Fully Modular RGB PSU (WW)', 0, 0, '2026-06-13 12:15:23'),
(10, 21, '/backend/product-pictures/power-supply/rmx-series-rm750x-corsair.png', 'RMx Series™ RM1000x — 1000 Watt 80 PLUS Gold Fully Modular ATX PSU (EU)', 0, 0, '2026-06-13 12:15:23'),
(11, 23, '/backend/product-pictures/fans/icue-link-rx140-max-rgb140mm-pwm-w.png', 'iCUE ML140 RGB 140mm PWM Magnetic Levitation Fan', 0, 0, '2026-06-13 12:22:43'),
(12, 24, '/backend/product-pictures/fans/rs120-argb-120mm-pwm-fans-triplepack.png', '\r\nRS120 ARGB 120mm PWM Fans - Triple Pack', 0, 0, '2026-06-13 12:22:43'),
(13, 25, '/backend/product-pictures/motherboards/msi-b840m-gaming-wifi-am5-matx-mb.png', 'MSI B840M GAMING PLUS WIFI6E AM5 mATX Motherboard', 0, 0, '2026-06-13 12:30:03'),
(14, 26, '/backend/product-pictures/motherboards/mag-z890-tomahawk-wifi_II-mb.png', 'MAG Z890 TOMAHAWK WIFI II Mainboard', 0, 0, '2026-06-13 12:30:03');

-- --------------------------------------------------------

--
-- Table structure for table `product_ratings`
--

CREATE TABLE `product_ratings` (
  `rating_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `score` tinyint(4) NOT NULL CHECK (`score` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `rememberme_hash` varchar(100) DEFAULT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fk_title_id` int(11) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `first_name`, `last_name`, `rememberme_hash`, `is_admin`, `is_active`, `created_at`, `fk_title_id`, `reset_token`, `reset_token_expires`) VALUES
(16, 'jakob', '$2y$12$KnhPc/E7DP2cus7wgFr8meSfgSH4TLh9Ddvlh0YL1dEFvRZwTcoa6', 'email@test.com', 'Jakob', 'Test', NULL, 0, 1, '2026-04-25 10:33:01', NULL, NULL, NULL),
(17, 'lintaf', '$2y$12$WhA517iYrnHNIRkRkZjdwepW7h2yEfpSWNMJb6KfDxR8IDHRq6QTa', 'lin.taf@gmail.com', 'Linda', 'Taferner', NULL, 1, 1, '2026-05-29 18:17:29', 1, NULL, NULL),
(20, 'adminBeate', '$2y$12$HNHZ3e9GrXiPagol0jECOu3X7bWEpZC4paDi.0CMIzQmIBI36d8aC', 'beate.admin@gmail.com', 'Beate', 'Admin', 'c29cf38dbf381616d758665a6bb771dcf09e4d6dd338c008eada23d93a3bbadd', 1, 1, '2026-06-15 08:32:09', 1, NULL, NULL),
(32, 'musterMax', '$2y$12$pi822oOJu2Rbs93AT6rU/ufVWH7gMvQsK9jBrhN7cS3C.YN1MonHC', 'max.muster@gmail.com', 'Max', 'Mustermann', NULL, 0, 1, '2026-06-15 09:17:10', 3, NULL, NULL),
(33, 'musterTabea17', '$2y$12$dZwBJaXY92ykJzYTICunL.1Se4L6f/odpU1XO0hUgF0bG6RzpA/CW', 'tabea.muster12@gmail.com', 'Tabea', 'Musterfrau', NULL, 0, 1, '2026-06-15 09:21:06', 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_titles`
--

CREATE TABLE `user_titles` (
  `title_id` int(11) NOT NULL,
  `title_value` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_titles`
--

INSERT INTO `user_titles` (`title_id`, `title_value`, `created_at`) VALUES
(1, 'Ms', '2026-04-24 21:19:49'),
(2, 'Mrs', '2026-04-24 21:19:49'),
(3, 'Mr', '2026-04-24 21:19:49');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `fk_user_id` int(11) NOT NULL,
  `fk_product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD UNIQUE KEY `fk_user_id` (`fk_user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`),
  ADD KEY `idx_cart_user` (`fk_user_id`),
  ADD KEY `idx_cart_product` (`fk_product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `idx_orders_user` (`fk_user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `idx_order_items_order` (`fk_order_id`),
  ADD KEY `idx_order_items_product` (`fk_product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `idx_products_category` (`fk_category_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `idx_product_images_product` (`fk_product_id`);

--
-- Indexes for table `product_ratings`
--
ALTER TABLE `product_ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD UNIQUE KEY `unique_user_product_rating` (`user_id`,`product_id`),
  ADD KEY `fk_product_ratings_product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_title_id` (`fk_title_id`);

--
-- Indexes for table `user_titles`
--
ALTER TABLE `user_titles`
  ADD PRIMARY KEY (`title_id`),
  ADD UNIQUE KEY `title_value` (`title_value`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`fk_user_id`,`fk_product_id`),
  ADD KEY `FK_wishlist_product` (`fk_product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `product_ratings`
--
ALTER TABLE `product_ratings`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `user_titles`
--
ALTER TABLE `user_titles`
  MODIFY `title_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `FK_addresses_user` FOREIGN KEY (`fk_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `FK_cart_items_product` FOREIGN KEY (`fk_product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_cart_items_user` FOREIGN KEY (`fk_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK_orders_user` FOREIGN KEY (`fk_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FK_order_items_order` FOREIGN KEY (`fk_order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_order_items_product` FOREIGN KEY (`fk_product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FK_products_category` FOREIGN KEY (`fk_category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `FK_product_images_product` FOREIGN KEY (`fk_product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_ratings`
--
ALTER TABLE `product_ratings`
  ADD CONSTRAINT `fk_product_ratings_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_ratings_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_title_id` FOREIGN KEY (`fk_title_id`) REFERENCES `user_titles` (`title_id`) ON DELETE SET NULL;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `FK_wishlist_product` FOREIGN KEY (`fk_product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_wishlist_user` FOREIGN KEY (`fk_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
