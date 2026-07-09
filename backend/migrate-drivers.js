/**
 * Driver Management System Migration Script
 * Run this to create drivers, deliveries, and delivery_reassignments tables
 */

const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting driver management system migration...\n');

  try {
    // Read the migration SQL file
    const sqlPath = path.join(__dirname, 'database', 'drivers-migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 100)}...`);
      await db.query(statement);
      console.log('✓ Success\n');
    }

    console.log('✅ Migration completed successfully!');
    console.log('\nCreated tables:');
    console.log('  - drivers');
    console.log('  - deliveries');
    console.log('  - delivery_reassignments');
    console.log('\nAdded columns to orders:');
    console.log('  - current_delivery_id');
    console.log('  - driver_assigned_at');

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

runMigration();
