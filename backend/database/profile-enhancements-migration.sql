-- Migration: Profile Enhancements
-- Adds health information fields, appointment notes/reports, and navigation fixes
-- Date: 2026-07-03

-- Ensure customers table has all required fields
ALTER TABLE customers 
  MODIFY COLUMN landmark VARCHAR(255) COMMENT 'Closest landmark to delivery address',
  MODIFY COLUMN chronic_conditions TEXT COMMENT 'Comma-separated list: diabetes, hypertension, asthma, etc.',
  MODIFY COLUMN allergies TEXT COMMENT 'Known drug or food allergies',
  MODIFY COLUMN profile_completed BOOLEAN DEFAULT FALSE COMMENT 'True when user has provided all required details',
  ADD INDEX IF NOT EXISTS idx_profile_completed (profile_completed);

-- Ensure orders table has customer tracking fields
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS customer_id INT DEFAULT NULL AFTER id,
  ADD COLUMN IF NOT EXISTS handled_by INT DEFAULT NULL COMMENT 'Admin who processed this order',
  ADD COLUMN IF NOT EXISTS handled_by_name VARCHAR(255) DEFAULT NULL COMMENT 'Name of admin for display',
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT NULL COMMENT 'mpesa, cash, bank_transfer',
  ADD COLUMN IF NOT EXISTS mpesa_receipt VARCHAR(50) DEFAULT NULL COMMENT 'M-Pesa receipt number';

-- Link appointments to customer accounts
ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS customer_id INT DEFAULT NULL AFTER id,
  ADD COLUMN IF NOT EXISTS handled_by INT DEFAULT NULL COMMENT 'Doctor/admin who handled appointment',
  ADD COLUMN IF NOT EXISTS handled_by_name VARCHAR(255) DEFAULT NULL COMMENT 'Name of doctor for display';

-- Create appointment notes table if not exists
CREATE TABLE IF NOT EXISTS appointment_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  admin_id INT COMMENT 'Doctor/admin who created the note',
  admin_name VARCHAR(255) COMMENT 'Name of doctor/admin for display',
  note TEXT NOT NULL COMMENT 'Consultation notes, diagnosis, recommendations',
  is_visible_to_client BOOLEAN DEFAULT TRUE COMMENT 'Client can see this note in their account',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  INDEX idx_appointment_id (appointment_id),
  INDEX idx_visible (is_visible_to_client)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create appointment reports table if not exists
CREATE TABLE IF NOT EXISTS appointment_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  admin_id INT COMMENT 'Doctor/admin who uploaded the report',
  admin_name VARCHAR(255) COMMENT 'Name of doctor/admin for display',
  file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
  file_path VARCHAR(500) NOT NULL COMMENT 'Server path to uploaded file',
  file_type VARCHAR(50) COMMENT 'MIME type: application/pdf, image/jpeg, etc.',
  description VARCHAR(500) COMMENT 'Report description: Lab results, X-ray, etc.',
  is_visible_to_client BOOLEAN DEFAULT TRUE COMMENT 'Client can download this report',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  INDEX idx_appointment_id (appointment_id),
  INDEX idx_visible (is_visible_to_client)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Link existing orders to customers by email (if customer account exists)
UPDATE orders o
INNER JOIN customers c ON o.email = c.email
SET o.customer_id = c.id
WHERE o.customer_id IS NULL AND o.email IS NOT NULL;

-- Link existing appointments to customers by email
UPDATE appointments a
INNER JOIN customers c ON a.email = c.email
SET a.customer_id = c.id
WHERE a.customer_id IS NULL AND a.email IS NOT NULL;
