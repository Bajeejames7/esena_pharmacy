const db = require('./config/db');

async function migrate() {
  try {
    const [cols] = await db.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'delivery_type'
    `);
    if (cols.length === 0) {
      await db.query("ALTER TABLE orders ADD COLUMN delivery_type ENUM('delivery','pickup') DEFAULT 'delivery' AFTER notes");
      console.log('delivery_type column added');
    } else {
      console.log('delivery_type column already exists — skipped');
    }

    // Full status list, including 'cancelled' — this used to omit it and silently
    // truncate the enum on any DB where this ran after 'cancelled' was added to schema.sql.
    await db.query("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','payment_requested','paid','dispatched','ready_for_pickup','completed','cancelled') DEFAULT 'pending'");
    console.log('status ENUM confirmed (includes ready_for_pickup and cancelled)');
    process.exit(0);
  } catch(e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  }
}

migrate();
