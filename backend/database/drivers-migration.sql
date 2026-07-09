-- Driver Management System Migration
-- Creates tables for driver registration and delivery tracking

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  national_id VARCHAR(50),
  license_number VARCHAR(50),
  vehicle_type ENUM('bike', 'car', 'van') DEFAULT 'bike',
  vehicle_registration VARCHAR(50),
  profile_picture VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deliveries table (tracks order assignments to drivers)
CREATE TABLE IF NOT EXISTS deliveries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  driver_id INT NOT NULL,
  assigned_by INT NOT NULL COMMENT 'User ID of admin/employee who assigned',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('assigned', 'out_for_delivery', 'delivered', 'failed') DEFAULT 'assigned',
  started_at TIMESTAMP NULL COMMENT 'When driver started delivery',
  completed_at TIMESTAMP NULL,
  failed_reason TEXT,
  delivery_notes TEXT COMMENT 'Driver notes about delivery',
  proof_of_delivery VARCHAR(255) COMMENT 'Photo URL of proof',
  customer_rating TINYINT NULL COMMENT '1-5 star rating',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_driver_id (driver_id),
  INDEX idx_status (status),
  INDEX idx_assigned_at (assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delivery reassignment log (audit trail)
CREATE TABLE IF NOT EXISTS delivery_reassignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_id INT NOT NULL,
  order_id INT NOT NULL,
  old_driver_id INT NULL,
  new_driver_id INT NOT NULL,
  reassigned_by INT NOT NULL,
  reason TEXT,
  reassigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (old_driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
  FOREIGN KEY (new_driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  FOREIGN KEY (reassigned_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_delivery_id (delivery_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add delivery_id to orders table for quick reference
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS current_delivery_id INT NULL,
ADD COLUMN IF NOT EXISTS driver_assigned_at TIMESTAMP NULL,
ADD INDEX IF NOT EXISTS idx_current_delivery (current_delivery_id);

-- Update order status enum to include delivery statuses (if not already present)
-- Note: This will only work if these statuses don't exist
-- ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'payment_requested', 'paid', 'dispatched', 'out_for_delivery', 'ready_for_pickup', 'delivered', 'completed', 'cancelled') NOT NULL DEFAULT 'pending';
