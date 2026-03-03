-- Tong Studio Booking Form - Database Schema
-- Run this against your MySQL/MariaDB database.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- Admins (for admin login)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admins_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin: username "admin", password "password" (change after first login)
INSERT IGNORE INTO `admins` (`id`, `username`, `password_hash`) VALUES
  (1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- ---------------------------------------------------------------------------
-- Studios (reference: matches FEATURED_STUDIOS ids in frontend)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `studios` (
  `id` VARCHAR(10) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: seed studios (ids must match FeaturedConstants.ts)
INSERT IGNORE INTO `studios` (`id`, `title`, `location`) VALUES
  ('1', 'Podcast Studio A', 'Main Booth'),
  ('2', 'Photo Studio', 'Cyclo & Sets'),
  ('3', 'Video Suite', 'Full Production'),
  ('4', 'Event & Workshop Space', 'Flex Space');

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `studio_id` VARCHAR(10) NOT NULL COMMENT 'Setup/studio from step 1 (matches studios.id)',
  `booking_date` DATE NOT NULL COMMENT 'Date selected in step 2',
  `timing_slot` VARCHAR(10) NOT NULL COMMENT '2h, 4h, 12h, 24h',
  `addons` JSON DEFAULT NULL COMMENT 'Array of addon ids e.g. ["lighting","crew"]',
  `extra_requests` TEXT DEFAULT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `status` ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking_date` (`booking_date`),
  KEY `idx_studio_id` (`studio_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_bookings_studio` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
