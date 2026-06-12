-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: database:3306
-- Generation Time: Jun 12, 2026 at 08:27 PM
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
(1, 3, '1010', 'john doe st. 1', 'Vienna', 'Austria', '2026-04-13 19:12:26'),
(2, 4, '1010', 'john doe st. 1', 'Vienna', 'Austria', '2026-04-13 19:14:42'),
(3, 12, '', 'john doe st. 1', 'Vienna', 'Austria', '2026-04-25 09:58:44'),
(4, 13, '', 'john doe st. 1', 'Vienna', 'Austria', '2026-04-25 10:08:38'),
(5, 14, '1010', 'john doe st. 1', 'Vienna', 'Austria', '2026-04-25 10:09:21'),
(6, 16, '1111', 'Jakob Str. 1', 'Vienna', 'Austria', '2026-04-25 10:33:01'),
(7, 17, '1100', 'eine adresse 15', 'Vienna', 'Austria', '2026-05-29 18:17:29'),
(8, 19, '2363', 'Hans strasse 19', 'Köln', 'Germany', '2026-06-12 13:05:12');

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
(10, 19, 1497.00, 'pending', '2026-06-12 13:06:48');

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
(9, 9, 10, 2, 499.00),
(10, 10, 1, 2, 499.00),
(11, 10, 8, 1, 499.00);

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
(1, 'RTX-5080', 'Wooow such a nice graphics card!', 4.8, 10, 499.00, 20, 1, '2026-04-25 11:20:10'),
(2, 'RTX-5080', 'Wooow such a nice graphics card!', 2.2, 10, 135.00, 20, 1, '2026-04-25 11:52:44'),
(3, 'RTX-5080', 'Wooow such a nice graphics card!', 2.3, 10, 280.00, 20, 1, '2026-04-25 11:53:00'),
(4, 'RTX-5080', 'Wooow such a nice graphics card!', 2.7, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(5, 'RTX-5080', 'Wooow such a nice graphics card!', 2.8, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(6, 'RTX-5080', 'Wooow such a nice graphics card!', 4.2, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(7, 'RTX-5080', 'Wooow such a nice graphics card!', 4.8, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(8, 'RTX-5080', 'Wooow such a nice graphics card!', 4.8, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(9, 'RTX-5080', 'Wooow such a nice graphics card!', 4.8, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(10, 'RTX-5080', 'Wooow such a nice graphics card!', 4.8, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(11, 'RTX-5080', 'Wooow such a nice graphics card!', 4.8, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(12, 'RTX-5080', 'Wooow such a nice graphics card!', 3.6, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(13, 'RTX-5080', 'Wooow such a nice graphics card!', 3.4, 10, 499.00, 20, 1, '2026-04-25 11:53:00'),
(14, 'RTX-5080', 'Wooow such a nice graphics card!', 0.0, 10, 499.00, 20, 1, '2026-04-26 11:30:59');

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
(1, 1, '/backend/product-pictures/RTX-5080-16g-vanguard-msi.png', 'RTX-5080 graphics card', 0, 1, '2026-04-26 10:04:02'),
(2, 1, '/backend/product-pictures/RTX-5080-16g-vanguard-msi.png', 'RTX-5080 graphics card', 0, 0, '2026-04-26 10:38:01');

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
(3, 'johndoe', '$2y$12$iyDZecLBc.TZ1sug74F7BOHIzifZffgLreg3iPcAFic5ncx4kYzZW', 'john@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-13 19:12:26', NULL, NULL, NULL),
(4, 'john2doe', 'c2713b62c903791bdefc5a6a99df04d4330de491bbc7a0ca6a5007337e4a6028', 'john2@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-13 19:14:42', NULL, NULL, NULL),
(5, 'johndoe4', '$2y$12$Ji6V1eLWNtcUIwsILvlZeeMmUuzVHR3CGT7n36khZKA.lodfFXg8S', 'john4@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-25 09:10:08', NULL, NULL, NULL),
(6, 'johndoe5', '$2y$12$TRILSWa44VJc94iGXoTqIO3/v0pfRr088Qh6M8x8L0ZAy4P6cxjY2', 'john5@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-25 09:14:33', NULL, NULL, NULL),
(7, 'johndoe6', '$2y$12$z5q5ES3Xy8MB/QQW4mXD1.6DHdEm9J1hwrU4gsDJrznjOXyM8FY4u', 'john6@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-25 09:15:30', NULL, NULL, NULL),
(8, 'johndoe7', '$2y$12$th457wWp1mwZXZz50DMHk.d5kcYTbSYJKnWNewClxdwKcs4qx.n5i', 'john7@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-25 09:16:02', NULL, NULL, NULL),
(9, 'johndoe8', '$2y$12$yMwqUwo5aMfEQ6frqfYMmuFb3piZdmvUkC69SmH/CUSxdz4WAthVO', 'john8@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-25 09:30:01', NULL, NULL, NULL),
(12, 'johndoe11', '$2y$12$2aL5.HIzd2hFLWTyAuciH.wE68bJaTioejb4.BYFP5vea8qTDdDkC', 'john11@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-25 09:58:44', NULL, NULL, NULL),
(13, 'johndoe12', '$2y$12$wJvYGgdF0kZKpGNIQLBTDeuy2bTuJ38kxvNkrZDkW4MiMUvOX5hrC', 'john12@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-25 10:08:38', NULL, NULL, NULL),
(14, 'johndoe13', '$2y$12$gc6p4uqQap2vFPi56QkzzuX.bEa3Z.u4IrjdJ24S6wveTqxYKBUuO', 'john13@doe.com', 'John', 'Doe', NULL, 0, 1, '2026-04-25 10:09:21', NULL, NULL, NULL),
(16, 'jakob', '$2y$12$KnhPc/E7DP2cus7wgFr8meSfgSH4TLh9Ddvlh0YL1dEFvRZwTcoa6', 'email@test.com', 'Jakob', 'Test', NULL, 0, 1, '2026-04-25 10:33:01', NULL, NULL, NULL),
(17, 'lintaf', '$2y$12$WhA517iYrnHNIRkRkZjdwepW7h2yEfpSWNMJb6KfDxR8IDHRq6QTa', 'lin.taf@gmail.com', 'lindores', 'tafernur', NULL, 1, 1, '2026-05-29 18:17:29', 2, NULL, NULL),
(19, 'he335', '$2y$12$1OEFfdaKThEOxpXYJ0iY7ef8TAqDli/DXsTmzjEZm/0lLqeapMGRC', 'peter@gmail.com', 'hans', 'gew', NULL, 0, 1, '2026-06-12 13:05:12', 1, NULL, NULL);

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
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `product_ratings`
--
ALTER TABLE `product_ratings`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

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
