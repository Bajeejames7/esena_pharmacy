-- ============================================================
-- K2 Connect (Kopo Kopo) Payment Integration Migration
-- Run once against the DB before deploying the K2 integration
-- ============================================================

-- 1. Payment attempt tracking table (one row per STK push request)
CREATE TABLE IF NOT EXISTS mpesa_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  checkout_request_id VARCHAR(100) UNIQUE NOT NULL,  -- K2 incoming_payment request id
  merchant_request_id VARCHAR(100) NOT NULL,          -- same as checkout_request_id for K2
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

-- 2. Payment method + receipt tracking on orders
-- Plain ALTER TABLE (no IF NOT EXISTS) — that syntax is MariaDB-only, not
-- standard MySQL. Run once against a fresh DB.
ALTER TABLE orders
  ADD COLUMN payment_method ENUM('cash','mpesa','bank_transfer','card') NULL DEFAULT NULL
    COMMENT 'How the order was actually paid for',
  ADD COLUMN mpesa_receipt VARCHAR(50) NULL DEFAULT NULL
    COMMENT 'M-Pesa receipt number when payment_method = mpesa',
  ADD INDEX idx_payment_method (payment_method);
