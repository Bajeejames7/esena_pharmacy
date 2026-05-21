/**
 * Migration: Create stock_movements table and seed initial movements
 * from existing product stock values.
 * Run once: node migrate-stock-movements.js
 */
require('dotenv').config();
const db = require('./config/db');

async function migrate() {
  const connection = await db.getConnection();
  try {
    console.log('Creating stock_movements table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`stock_movements\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`product_id\` int(11) NOT NULL,
        \`type\` enum('restock','sale','adjustment','return','damage','initial') NOT NULL,
        \`quantity\` int(11) NOT NULL COMMENT 'positive = stock in, negative = stock out',
        \`note\` text DEFAULT NULL,
        \`reference_id\` int(11) DEFAULT NULL COMMENT 'order_id for sale/return movements',
        \`performed_by\` int(11) DEFAULT NULL,
        \`performed_by_name\` varchar(255) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`idx_product_id\` (\`product_id\`),
        KEY \`idx_type\` (\`type\`),
        KEY \`idx_created_at\` (\`created_at\`),
        KEY \`idx_reference_id\` (\`reference_id\`),
        CONSTRAINT \`stock_movements_ibfk_1\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('Table created.');

    // Seed initial movements for products that have stock > 0 and no existing movements
    const [products] = await connection.query('SELECT id, name, stock FROM products WHERE stock > 0');
    let seeded = 0;
    for (const product of products) {
      const [existing] = await connection.query(
        'SELECT id FROM stock_movements WHERE product_id = ? AND type = "initial" LIMIT 1',
        [product.id]
      );
      if (existing.length === 0) {
        await connection.query(
          `INSERT INTO stock_movements (product_id, type, quantity, note, performed_by_name)
           VALUES (?, 'initial', ?, 'Opening stock balance (migrated)', 'System')`,
          [product.id, product.stock]
        );
        seeded++;
      }
    }
    console.log(`Seeded initial movements for ${seeded} products.`);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
