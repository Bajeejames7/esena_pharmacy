-- M-Pesa Payment Integration Migration
-- Run this to add M-Pesa payment tracking capabilities

-- 1. Add M-Pesa payment tracking table
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_checkout_request (checkout_request_id),
  INDEX idx_mpesa_receipt (mpesa_receipt_number),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add payment method and M-Pesa reference to orders table
ALTER TABLE orders 
ADD COLUMN payment_method ENUM('cash','mpesa','bank_transfer') DEFAULT 'cash' AFTER status,
ADD COLUMN mpesa_receipt VARCHAR(50) AFTER payment_method,
ADD INDEX idx_payment_method (payment_method);

-- 3. Add payment timeout tracking
ALTER TABLE mpesa_payments
ADD COLUMN expires_at DATETIME AFTER created_at;

-- 4. Create index for efficient cleanup of expired pending payments
CREATE INDEX idx_expires_at ON mpesa_payments(expires_at) WHERE status = 'pending';
