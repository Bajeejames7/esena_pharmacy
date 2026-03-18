const db = require('./config/db');

async function migrate() {
  try {
    await db.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type ENUM('delivery','pickup') DEFAULT 'delivery' AFTER notes");
    console.log('delivery_type column added');
    await db.query("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','payment_requested','paid','dispatched','ready_for_pickup','completed') DEFAULT 'pending'");
    console.log('status ENUM updated with ready_for_pickup');
    process.exit(0);
  } catch(e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  }
}

migrate();
