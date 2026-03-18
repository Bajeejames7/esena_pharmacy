/**
 * Migration: Expand appointment services
 * Run once: node migrate-services.js
 */
require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  try {
    console.log('Altering appointments.service column from ENUM to VARCHAR(100)...');
    await db.query(`ALTER TABLE appointments MODIFY COLUMN service VARCHAR(100) NOT NULL`);
    console.log('Done. Service column is now VARCHAR(100) — accepts any service name.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
