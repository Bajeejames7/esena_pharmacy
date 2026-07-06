#!/usr/bin/env node

/**
 * Migration Runner
 * Runs the profile enhancements migration SQL
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runMigration() {
  console.log('🚀 Running Profile Enhancements Migration...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'esena_pharmacy',
    multipleStatements: true
  });

  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'database', 'profile-enhancements-migration.sql'),
      'utf-8'
    );

    console.log('📝 Executing migration SQL...');
    await connection.query(migrationSQL);
    console.log('✅ Migration completed successfully!\n');

    console.log('📊 Summary of changes:');
    console.log('  - Enhanced customers table with health information fields');
    console.log('  - Added customer_id link to orders and appointments');
    console.log('  - Created appointment_notes table for doctor comments');
    console.log('  - Created appointment_reports table for medical documents');
    console.log('  - Linked existing orders and appointments to customer accounts\n');

    console.log('🎉 All done! Your database is ready.\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
