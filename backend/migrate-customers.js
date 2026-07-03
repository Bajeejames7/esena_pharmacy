#!/usr/bin/env node
require('dotenv').config();
const db = require('./config/db');

const run = async () => {
  const conn = await db.getConnection();
  console.log('Running customer accounts migration...\n');
  try {
    await conn.beginTransaction();

    // 1. customers table
    console.log('Creating customers table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firebase_uid VARCHAR(128) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        delivery_address TEXT,
        city VARCHAR(100),
        county VARCHAR(100),
        auth_provider ENUM('google','email') DEFAULT 'email',
        profile_picture VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_firebase_uid (firebase_uid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ customers table ready\n');

    // 2. customer_id column on orders
    console.log('Adding customer_id to orders...');
    const [cols] = await conn.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'customer_id'
    `);
    if (cols.length === 0) {
      await conn.query(`ALTER TABLE orders ADD COLUMN customer_id INT DEFAULT NULL AFTER id`);
      console.log('  ✅ customer_id column added\n');
    } else {
      console.log('  ⏩ customer_id already exists\n');
    }

    await conn.commit();
    console.log('🎉 Customer migration complete!');
  } catch (err) {
    await conn.rollback();
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
};

run();
