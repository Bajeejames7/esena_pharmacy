/**
 * Migration: Allow prescription-based order items (no product_id)
 * Run once: node migrate-prescription-orders.js
 */
require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  try {
    // Make product_id nullable (prescription items don't have a product record)
    await db.query(`
      ALTER TABLE order_items
        MODIFY COLUMN product_id INT NULL,
        DROP FOREIGN KEY IF EXISTS order_items_ibfk_2
    `).catch(() => {
      // Some MySQL versions need the constraint name — try alternate approach
    });

    // Try dropping FK by finding its name first
    const [fks] = await db.query(`
      SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'order_items'
        AND COLUMN_NAME = 'product_id'
        AND REFERENCED_TABLE_NAME = 'products'
    `);

    for (const fk of fks) {
      await db.query(`ALTER TABLE order_items DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``).catch(() => {});
    }

    // Now make product_id nullable
    await db.query(`ALTER TABLE order_items MODIFY COLUMN product_id INT NULL`);
    console.log('✅ product_id is now nullable');

    // Add item_name column if not exists
    const [cols] = await db.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'item_name'
    `);
    if (cols.length === 0) {
      await db.query(`ALTER TABLE order_items ADD COLUMN item_name VARCHAR(255) NULL AFTER price`);
      console.log('✅ item_name column added to order_items');
    } else {
      console.log('ℹ️  item_name column already exists');
    }

    console.log('✅ Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
