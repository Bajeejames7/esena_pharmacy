/**
 * Migration: Employee management system
 * Run once on the server to set up the new tables and columns
 */
const db = require('./config/db');

async function migrate() {
  console.log('Running employee management migration...');

  // 1. Extend users table
  const userAlters = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active','inactive','pending') NOT NULL DEFAULT 'active'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(10) NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires DATETIME NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_enabled TINYINT(1) NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_secret VARCHAR(64) NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login DATETIME NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL",
    "ALTER TABLE users ADD UNIQUE INDEX IF NOT EXISTS idx_users_email (email)",
  ];

  for (const sql of userAlters) {
    try { await db.query(sql); console.log('OK:', sql.substring(0, 60)); }
    catch (e) { console.warn('Skip (may already exist):', e.message.substring(0, 80)); }
  }

  // 2. Update admin user to have email and active status
  await db.query(
    "UPDATE users SET email = 'esenapharmacy@gmail.com', status = 'active' WHERE username = 'admin' AND (email IS NULL OR email = '')"
  );
  console.log('Admin email set');

  // 3. Update role enum to include employee
  try {
    await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin','employee','doctor') DEFAULT 'employee'");
    console.log('Role enum updated');
  } catch (e) { console.warn('Role enum skip:', e.message.substring(0, 80)); }

  // 4. Create activity_log table
  await db.query(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      user_name VARCHAR(100) NOT NULL,
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(50) NOT NULL,
      resource_id INT NULL,
      description TEXT NULL,
      old_value TEXT NULL,
      new_value TEXT NULL,
      ip_address VARCHAR(45) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_resource (resource_type, resource_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('activity_log table ready');

  // 5. Add handled_by columns to orders, appointments, prescriptions
  const resourceAlters = [
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS handled_by INT NULL",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS handled_by_name VARCHAR(100) NULL",
    "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS handled_by INT NULL",
    "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS handled_by_name VARCHAR(100) NULL",
    "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS handled_by INT NULL",
    "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS handled_by_name VARCHAR(100) NULL",
    "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS created_by INT NULL",
    "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100) NULL",
  ];

  for (const sql of resourceAlters) {
    try { await db.query(sql); console.log('OK:', sql.substring(0, 60)); }
    catch (e) { console.warn('Skip:', e.message.substring(0, 80)); }
  }

  console.log('\nMigration complete!');
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
