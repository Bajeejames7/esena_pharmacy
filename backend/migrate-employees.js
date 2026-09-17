/**
 * Migration: Employee management system
 * Run once on the server to set up the new tables and columns
 */
const db = require('./config/db');

async function columnExists(table, column) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function indexExists(table, indexName) {
  const [rows] = await db.query(
    `SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, indexName]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(table, column, ddl) {
  if (await columnExists(table, column)) {
    console.log(`Skip: ${table}.${column} already exists`);
    return;
  }
  await db.query(ddl);
  console.log(`OK: added ${table}.${column}`);
}

async function migrate() {
  console.log('Running employee management migration...');

  // 1. Extend users table
  await addColumnIfMissing('users', 'email', "ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL");
  await addColumnIfMissing('users', 'status', "ALTER TABLE users ADD COLUMN status ENUM('active','inactive','pending') NOT NULL DEFAULT 'active'");
  await addColumnIfMissing('users', 'otp', "ALTER TABLE users ADD COLUMN otp VARCHAR(10) NULL");
  await addColumnIfMissing('users', 'otp_expires', "ALTER TABLE users ADD COLUMN otp_expires DATETIME NULL");
  await addColumnIfMissing('users', 'two_fa_enabled', "ALTER TABLE users ADD COLUMN two_fa_enabled TINYINT(1) NOT NULL DEFAULT 0");
  await addColumnIfMissing('users', 'two_fa_secret', "ALTER TABLE users ADD COLUMN two_fa_secret VARCHAR(64) NULL");
  await addColumnIfMissing('users', 'last_login', "ALTER TABLE users ADD COLUMN last_login DATETIME NULL");
  await addColumnIfMissing('users', 'full_name', "ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NULL");
  await addColumnIfMissing('users', 'phone', "ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL");

  if (await indexExists('users', 'idx_users_email')) {
    console.log('Skip: users.idx_users_email already exists');
  } else {
    await db.query('ALTER TABLE users ADD UNIQUE INDEX idx_users_email (email)');
    console.log('OK: added unique index users.idx_users_email');
  }

  // 2. Update admin user to have email and active status
  await db.query(
    "UPDATE users SET email = 'esenapharmacy@gmail.com', status = 'active' WHERE username = 'admin' AND (email IS NULL OR email = '')"
  );
  console.log('Admin email set');

  // 3. Update role enum to include employee
  await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin','employee','doctor') DEFAULT 'employee'");
  console.log('Role enum updated');

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
  await addColumnIfMissing('orders', 'handled_by', "ALTER TABLE orders ADD COLUMN handled_by INT NULL");
  await addColumnIfMissing('orders', 'handled_by_name', "ALTER TABLE orders ADD COLUMN handled_by_name VARCHAR(100) NULL");
  await addColumnIfMissing('appointments', 'handled_by', "ALTER TABLE appointments ADD COLUMN handled_by INT NULL");
  await addColumnIfMissing('appointments', 'handled_by_name', "ALTER TABLE appointments ADD COLUMN handled_by_name VARCHAR(100) NULL");
  await addColumnIfMissing('prescriptions', 'handled_by', "ALTER TABLE prescriptions ADD COLUMN handled_by INT NULL");
  await addColumnIfMissing('prescriptions', 'handled_by_name', "ALTER TABLE prescriptions ADD COLUMN handled_by_name VARCHAR(100) NULL");
  await addColumnIfMissing('blogs', 'created_by', "ALTER TABLE blogs ADD COLUMN created_by INT NULL");
  await addColumnIfMissing('blogs', 'created_by_name', "ALTER TABLE blogs ADD COLUMN created_by_name VARCHAR(100) NULL");

  console.log('\nMigration complete!');
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
