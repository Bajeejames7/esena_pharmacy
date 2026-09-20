/**
 * Migration: unique key on products.pos_medicine_id
 * Needed so scripts/import-pos-catalog.js can use a batched
 * INSERT ... ON DUPLICATE KEY UPDATE upsert. NULL is still allowed multiple
 * times under a UNIQUE index (InnoDB), so web-only products (no POS link)
 * are unaffected.
 * Run once on the server: node migrate-pos-products-unique.js
 */
const db = require('./config/db');

async function indexExists(table, indexName) {
  const [rows] = await db.query(
    `SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, indexName]
  );
  return rows.length > 0;
}

async function migrate() {
  console.log('Running products.pos_medicine_id unique-key migration...');

  if (await indexExists('products', 'uq_pos_medicine_id')) {
    console.log('Skip: uq_pos_medicine_id already exists');
  } else {
    // Drop the old plain index first if present — a column can't be covered
    // by both a plain index and a unique index of the same leading column
    // without redundancy, and MySQL will happily keep both, so this is just
    // tidy-up, not a correctness requirement.
    if (await indexExists('products', 'idx_pos_medicine_id')) {
      await db.query('ALTER TABLE products DROP INDEX idx_pos_medicine_id');
      console.log('OK: dropped old idx_pos_medicine_id');
    }
    await db.query('ALTER TABLE products ADD UNIQUE KEY uq_pos_medicine_id (pos_medicine_id)');
    console.log('OK: added UNIQUE KEY uq_pos_medicine_id');
  }

  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
