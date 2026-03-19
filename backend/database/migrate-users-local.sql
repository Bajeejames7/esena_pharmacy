-- Run this in phpMyAdmin on your local esena_pharmacy database
-- Adds missing columns to the users table for local development

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `email` varchar(255) DEFAULT NULL AFTER `username`,
  ADD COLUMN IF NOT EXISTS `full_name` varchar(255) DEFAULT NULL AFTER `email`,
  ADD COLUMN IF NOT EXISTS `phone` varchar(20) DEFAULT NULL AFTER `full_name`,
  ADD COLUMN IF NOT EXISTS `status` enum('active','inactive','pending') DEFAULT 'active' AFTER `role`,
  ADD COLUMN IF NOT EXISTS `otp` varchar(10) DEFAULT NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `otp_expires` datetime DEFAULT NULL AFTER `otp`,
  ADD COLUMN IF NOT EXISTS `two_fa_enabled` tinyint(1) DEFAULT 0 AFTER `otp_expires`,
  ADD COLUMN IF NOT EXISTS `two_fa_secret` varchar(255) DEFAULT NULL AFTER `two_fa_enabled`,
  ADD COLUMN IF NOT EXISTS `last_login` datetime DEFAULT NULL AFTER `two_fa_secret`;

-- Update the role enum to include 'employee' and 'doctor'
ALTER TABLE `users`
  MODIFY COLUMN `role` enum('admin','employee','doctor') DEFAULT 'admin';

-- Add indexes
ALTER TABLE `users`
  ADD UNIQUE KEY IF NOT EXISTS `email` (`email`),
  ADD KEY IF NOT EXISTS `idx_users_username` (`username`),
  ADD KEY IF NOT EXISTS `idx_users_role` (`role`);

-- Also add activity_log table if missing
CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SELECT 'Migration complete!' as result;
