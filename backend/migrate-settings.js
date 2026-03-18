const db = require('./config/db');

async function run() {
  console.log('Creating settings table...');
  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value VARCHAR(255) NOT NULL,
      description VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES
      ('delivery_nairobi',        '150', 'Delivery cost within Nairobi (KSH)'),
      ('delivery_outside_nairobi','350', 'Delivery cost outside Nairobi (KSH)'),
      ('pickup_cost',             '0',   'Cost for in-store pickup (KSH)')
  `);
  console.log('Settings table ready.');
  process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
