-- ============================================================
-- ESENA PHARMACY — DATABASE MIGRATION
-- Run this in phpMyAdmin on your esena_pharmacy database.
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS).
-- ============================================================

-- ── USERS TABLE ──────────────────────────────────────────────
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `email`           varchar(255)                          DEFAULT NULL  AFTER `username`,
  ADD COLUMN IF NOT EXISTS `full_name`       varchar(255)                          DEFAULT NULL  AFTER `email`,
  ADD COLUMN IF NOT EXISTS `phone`           varchar(20)                           DEFAULT NULL  AFTER `full_name`,
  ADD COLUMN IF NOT EXISTS `status`          enum('active','inactive','pending')   DEFAULT 'active' AFTER `role`,
  ADD COLUMN IF NOT EXISTS `otp`             varchar(10)                           DEFAULT NULL  AFTER `status`,
  ADD COLUMN IF NOT EXISTS `otp_expires`     datetime                              DEFAULT NULL  AFTER `otp`,
  ADD COLUMN IF NOT EXISTS `otp_attempts`    tinyint(3) UNSIGNED                   DEFAULT 0     AFTER `otp_expires`,
  ADD COLUMN IF NOT EXISTS `otp_window_start` datetime                             DEFAULT NULL  AFTER `otp_attempts`,
  ADD COLUMN IF NOT EXISTS `two_fa_enabled`  tinyint(1)                            DEFAULT 0     AFTER `otp_window_start`,
  ADD COLUMN IF NOT EXISTS `two_fa_secret`   varchar(255)                          DEFAULT NULL  AFTER `two_fa_enabled`,
  ADD COLUMN IF NOT EXISTS `last_login`      datetime                              DEFAULT NULL  AFTER `two_fa_secret`;

-- Widen role enum to include employee and doctor
ALTER TABLE `users`
  MODIFY COLUMN `role` enum('admin','employee','doctor') DEFAULT 'admin';

-- Indexes (safe — duplicate key names are ignored by MySQL)
ALTER TABLE `users`
  ADD UNIQUE KEY IF NOT EXISTS `email`             (`email`),
  ADD KEY       IF NOT EXISTS `idx_users_username` (`username`),
  ADD KEY       IF NOT EXISTS `idx_users_role`     (`role`),
  ADD KEY       IF NOT EXISTS `idx_users_status`   (`status`);

-- ── ORDERS TABLE — add missing columns ──────────────────────
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `handled_by`      int(11)      DEFAULT NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `handled_by_name` varchar(255) DEFAULT NULL AFTER `handled_by`;

-- ── APPOINTMENTS TABLE — add missing columns ─────────────────
ALTER TABLE `appointments`
  ADD COLUMN IF NOT EXISTS `handled_by`      int(11)      DEFAULT NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `handled_by_name` varchar(255) DEFAULT NULL AFTER `handled_by`;

-- ── ACTIVITY LOG TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `activity_log` (
  `id`            int(11)      NOT NULL AUTO_INCREMENT,
  `user_id`       int(11)      DEFAULT NULL,
  `user_name`     varchar(255) DEFAULT NULL,
  `action`        varchar(100) NOT NULL,
  `resource_type` varchar(50)  DEFAULT NULL,
  `resource_id`   int(11)      DEFAULT NULL,
  `description`   text         DEFAULT NULL,
  `old_value`     json         DEFAULT NULL,
  `new_value`     json         DEFAULT NULL,
  `ip_address`    varchar(45)  DEFAULT NULL,
  `created_at`    timestamp    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_activity_user`     (`user_id`),
  KEY `idx_activity_resource` (`resource_type`, `resource_id`),
  KEY `idx_activity_created`  (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── PRODUCTS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
  `id`          int(11)        NOT NULL AUTO_INCREMENT,
  `name`        varchar(255)   NOT NULL,
  `description` text           DEFAULT NULL,
  `price`       decimal(10,2)  NOT NULL DEFAULT 0.00,
  `stock`       int(11)        NOT NULL DEFAULT 0,
  `category`    varchar(100)   DEFAULT NULL,
  `image_url`   varchar(500)   DEFAULT NULL,
  `is_active`   tinyint(1)     DEFAULT 1,
  `created_at`  timestamp      NOT NULL DEFAULT current_timestamp(),
  `updated_at`  timestamp      NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category`),
  KEY `idx_products_active`   (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── ORDERS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               int(11)      NOT NULL AUTO_INCREMENT,
  `customer_name`    varchar(255) NOT NULL,
  `customer_email`   varchar(255) DEFAULT NULL,
  `customer_phone`   varchar(20)  DEFAULT NULL,
  `delivery_address` text         DEFAULT NULL,
  `items`            json         DEFAULT NULL,
  `total_amount`     decimal(10,2) DEFAULT 0.00,
  `status`           enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_method`   varchar(50)  DEFAULT NULL,
  `payment_status`   enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `notes`            text         DEFAULT NULL,
  `tracking_token`   varchar(100) DEFAULT NULL,
  `created_at`       timestamp    NOT NULL DEFAULT current_timestamp(),
  `updated_at`       timestamp    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_orders_status`  (`status`),
  KEY `idx_orders_created` (`created_at`),
  KEY `idx_orders_token`   (`tracking_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── APPOINTMENTS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `appointments` (
  `id`             int(11)      NOT NULL AUTO_INCREMENT,
  `patient_name`   varchar(255) NOT NULL,
  `patient_email`  varchar(255) DEFAULT NULL,
  `patient_phone`  varchar(20)  DEFAULT NULL,
  `service`        varchar(255) DEFAULT NULL,
  `appointment_date` date       DEFAULT NULL,
  `appointment_time` time       DEFAULT NULL,
  `status`         enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `notes`          text         DEFAULT NULL,
  `tracking_token` varchar(100) DEFAULT NULL,
  `created_at`     timestamp    NOT NULL DEFAULT current_timestamp(),
  `updated_at`     timestamp    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_appt_status`  (`status`),
  KEY `idx_appt_date`    (`appointment_date`),
  KEY `idx_appt_token`   (`tracking_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── PRESCRIPTIONS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id`             int(11)      NOT NULL AUTO_INCREMENT,
  `patient_name`   varchar(255) NOT NULL,
  `patient_email`  varchar(255) DEFAULT NULL,
  `patient_phone`  varchar(20)  DEFAULT NULL,
  `file_url`       varchar(500) DEFAULT NULL,
  `file_type`      varchar(50)  DEFAULT NULL,
  `notes`          text         DEFAULT NULL,
  `status`         enum('pending','reviewing','approved','rejected','dispensed') DEFAULT 'pending',
  `admin_notes`    text         DEFAULT NULL,
  `created_at`     timestamp    NOT NULL DEFAULT current_timestamp(),
  `updated_at`     timestamp    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_rx_status`  (`status`),
  KEY `idx_rx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── BLOGS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `blogs` (
  `id`          int(11)      NOT NULL AUTO_INCREMENT,
  `title`       varchar(500) NOT NULL,
  `slug`        varchar(500) DEFAULT NULL,
  `content`     longtext     DEFAULT NULL,
  `excerpt`     text         DEFAULT NULL,
  `image_url`   varchar(500) DEFAULT NULL,
  `author`      varchar(255) DEFAULT NULL,
  `is_published` tinyint(1)  DEFAULT 0,
  `created_at`  timestamp    NOT NULL DEFAULT current_timestamp(),
  `updated_at`  timestamp    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_blogs_slug`      (`slug`(191)),
  KEY `idx_blogs_published` (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── CONTACTS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `contacts` (
  `id`         int(11)      NOT NULL AUTO_INCREMENT,
  `name`       varchar(255) NOT NULL,
  `email`      varchar(255) DEFAULT NULL,
  `phone`      varchar(20)  DEFAULT NULL,
  `subject`    varchar(500) DEFAULT NULL,
  `message`    text         DEFAULT NULL,
  `status`     enum('new','read','replied') DEFAULT 'new',
  `created_at` timestamp    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_contacts_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── SETTINGS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `settings` (
  `id`          int(11)      NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text       DEFAULT NULL,
  `updated_at`  timestamp    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SELECT 'Migration complete! All tables are up to date.' AS result;
