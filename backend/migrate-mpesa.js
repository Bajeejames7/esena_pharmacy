#!/usr/bin/env node
/**
 * M-Pesa Database Migration
 * Run: node migrate-mpesa.js
 * 
 * Adds mpesa_payments table and updates orders table for M-Pesa support.
 */

require('dotenv').config();
const db = require('./config/db');

const runMigration = async () => {
  const connection = await db.getConnection();
  console.log('🔧 Running M-Pesa database migration...\n');

  try {
    await connection.beginTransaction();

    // 1. Create mpesa_payments table
    console.log('📋 Creating mpesa_payments table...');
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✅ mpesa_payments table created (or already exists)\n');

    // 2. Add payment_method column to orders (if not already present)
    console.log('📋 Adding payment_method column to orders table...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'payment_method'
    `);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE orders
        ADD COLUMN payment_method ENUM('cash','mpesa','bank_transfer') DEFAULT 'cash' AFTER status
      `);
      console.log("   ✅ payment_method column added\n");
    } else {
      console.log("   ⏩ payment_method column already exists — skipped\n");
    }

    // 3. Add mpesa_receipt column to orders (if not already present)
    console.log('📋 Adding mpesa_receipt column to orders table...');
    const [receiptCol] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'mpesa_receipt'
    `);

    if (receiptCol.length === 0) {
      await connection.query(`
        ALTER TABLE orders
        ADD COLUMN mpesa_receipt VARCHAR(50) AFTER payment_method
      `);
      console.log("   ✅ mpesa_receipt column added\n");
    } else {
      console.log("   ⏩ mpesa_receipt column already exists — skipped\n");
    }

    await connection.commit();

    console.log('🎉 M-Pesa migration completed successfully!\n');
    console.log('📌 Next steps:');
    console.log('   1. Add M-Pesa credentials to your .env file');
    console.log('   2. Set MPESA_CALLBACK_URL to your HTTPS server URL');
    console.log('   3. See MPESA_INTEGRATION_GUIDE.md for full setup instructions\n');

  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
};

runMigration();
