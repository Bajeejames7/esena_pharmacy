-- Esena Pharmacy Database Schema


-- Users / Admins
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','doctor') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  video VARCHAR(255),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

-- Orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  delivery_address TEXT,
  notes TEXT,
  delivery_type ENUM('delivery','pickup') DEFAULT 'delivery',
  delivery_zone ENUM('nairobi','outside_nairobi','pickup') DEFAULT 'nairobi',
  shipping_cost DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2),
  token VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending','payment_requested','paid','dispatched','ready_for_pickup','completed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Delivery Settings (admin-configurable)
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default delivery prices
INSERT INTO settings (setting_key, setting_value, description) VALUES
('delivery_nairobi', '150', 'Delivery cost within Nairobi (KSH)'),
('delivery_outside_nairobi', '350', 'Delivery cost outside Nairobi (KSH)'),
('pickup_cost', '0', 'Cost for in-store pickup (KSH)');

-- Order Items
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Appointments
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  service VARCHAR(100) NOT NULL,
  date DATETIME NOT NULL,
  time VARCHAR(10),
  message TEXT,
  token VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Contacts
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2a$10$rZ5qH8qF9xK3yL7mN9pO4.xJ5vK8wL9mN6pO4xJ5vK8wL9mN6pO4x', 'admin');
-- Blogs
CREATE TABLE blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  image VARCHAR(255),
  author VARCHAR(255) DEFAULT 'Esena Pharmacy',
  status ENUM('draft','published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Insert sample blog posts
INSERT INTO blogs (title, slug, excerpt, content, status) VALUES
('Understanding Your Medications: A Complete Guide', 'understanding-your-medications', 'Learn how to properly manage your medications for better health outcomes.', 
'<h2>Introduction</h2><p>Proper medication management is crucial for maintaining good health and ensuring that treatments are effective. This comprehensive guide will help you understand how to take your medications safely and effectively.</p><h2>Key Points to Remember</h2><ul><li>Always follow your doctor''s instructions</li><li>Take medications at the same time each day</li><li>Never skip doses</li><li>Store medications properly</li></ul><h2>Common Mistakes to Avoid</h2><p>Many people make simple mistakes that can reduce the effectiveness of their medications or cause harmful side effects. Here are the most common ones to avoid...</p>', 'published'),

('Seasonal Health Tips for Better Wellness', 'seasonal-health-tips', 'Stay healthy throughout the year with these seasonal wellness strategies.', 
'<h2>Spring Health Tips</h2><p>As the weather warms up, it''s important to adjust your health routine. Spring is the perfect time to start fresh with new healthy habits.</p><h2>Summer Wellness</h2><p>Hot weather brings unique health challenges. Stay hydrated, protect your skin from UV rays, and maintain a balanced diet rich in fresh fruits and vegetables.</p><h2>Fall Preparation</h2><p>Prepare your immune system for the colder months ahead with proper nutrition and preventive care.</p><h2>Winter Health</h2><p>Combat seasonal depression and maintain your health during the darker, colder months.</p>', 'published'),

('The Importance of Preventive Healthcare', 'preventive-healthcare-importance', 'Discover why prevention is better than cure and how to stay ahead of health issues.', 
'<h2>What is Preventive Healthcare?</h2><p>Preventive healthcare involves taking proactive steps to prevent illness and disease before they occur. This approach is not only better for your health but also more cost-effective in the long run.</p><h2>Types of Preventive Care</h2><ul><li>Regular check-ups and screenings</li><li>Vaccinations</li><li>Healthy lifestyle choices</li><li>Early detection programs</li></ul><h2>Benefits</h2><p>Regular preventive care can help detect health issues early when they''re most treatable, reduce healthcare costs, and improve quality of life.</p>', 'published');

-- Activity Log (audit trail for all system actions)
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INT,
  description TEXT,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_action (action),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- M-Pesa Payments
CREATE TABLE IF NOT EXISTS mpesa_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  checkout_request_id VARCHAR(100) UNIQUE NOT NULL,
  merchant_request_id VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  mpesa_receipt_number VARCHAR(50) UNIQUE,
  transaction_date DATETIME,
  result_code INT,
  result_desc VARCHAR(255),
  status ENUM('pending','success','failed','cancelled') DEFAULT 'pending',
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_checkout_request (checkout_request_id),
  INDEX idx_mpesa_receipt (mpesa_receipt_number),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer Accounts (regular users / patients)
-- Enhanced with location, health information, and mandatory profile completion
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  delivery_address TEXT,
  landmark VARCHAR(255) COMMENT 'Closest landmark to delivery address',
  date_of_birth DATE,
  blood_type ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown') DEFAULT 'Unknown',
  chronic_conditions TEXT COMMENT 'Comma-separated list: diabetes, hypertension, asthma, etc.',
  allergies TEXT COMMENT 'Known drug or food allergies',
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  profile_completed BOOLEAN DEFAULT FALSE COMMENT 'True when user has provided all required details',
  city VARCHAR(100),
  county VARCHAR(100),
  auth_provider ENUM('google','email') DEFAULT 'email',
  profile_picture VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_firebase_uid (firebase_uid),
  INDEX idx_profile_completed (profile_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointment notes (doctor/admin consultation notes visible to client)
-- Enhanced to support comments on appointments with client visibility
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

-- Appointment reports (files uploaded by doctor/admin, viewable by client)
-- Lab results, test reports, prescriptions, medical documents
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

-- Link customer accounts to their orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INT DEFAULT NULL AFTER id;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS handled_by INT DEFAULT NULL COMMENT 'Admin who processed this order';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS handled_by_name VARCHAR(255) DEFAULT NULL COMMENT 'Name of admin for display';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT NULL COMMENT 'mpesa, cash, bank_transfer';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mpesa_receipt VARCHAR(50) DEFAULT NULL COMMENT 'M-Pesa receipt number';

-- Link appointments to customer accounts
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_id INT DEFAULT NULL AFTER id;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS handled_by INT DEFAULT NULL COMMENT 'Doctor/admin who handled appointment';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS handled_by_name VARCHAR(255) DEFAULT NULL COMMENT 'Name of doctor for display';

-- ============================================================
-- DRIVER MANAGEMENT SYSTEM
-- Handles driver registration, delivery assignments, and proof of delivery
-- ============================================================

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

-- Add delivery tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS current_delivery_id INT NULL COMMENT 'Current active delivery assignment',
ADD COLUMN IF NOT EXISTS driver_assigned_at TIMESTAMP NULL COMMENT 'When driver was assigned';

-- Add index for delivery lookup
ALTER TABLE orders ADD INDEX IF NOT EXISTS idx_current_delivery (current_delivery_id);

-- Update order status enum to include delivery statuses
-- Note: This ALTER will fail if 'out_for_delivery' already exists in the enum
-- Run manually if needed:
-- ALTER TABLE orders MODIFY COLUMN status ENUM('pending','payment_requested','paid','dispatched','out_for_delivery','ready_for_pickup','completed','cancelled') NOT NULL DEFAULT 'pending';
