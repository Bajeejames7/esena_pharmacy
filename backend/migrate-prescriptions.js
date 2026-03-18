/**
 * Migration: Create prescriptions table
 * Run once: node migrate-prescriptions.js
 */
require('dotenv').config();
const db = require('./config/db');
const path = require('path');
const fs = require('fs');

async function migrate() {
  try {
    // Create upload directory
    const uploadDir = path.join(__dirname, 'uploads/prescriptions');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created uploads/prescriptions directory');
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT,
        file_path VARCHAR(255) NOT NULL,
        status ENUM('pending','reviewed','completed','cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_email (email),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('✅ prescriptions table created (or already exists)');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
