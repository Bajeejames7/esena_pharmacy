'use strict';

/**
 * scripts/import-pos-catalog.js
 *
 * One-time (and re-runnable) bulk import: turns the live Afymis POS
 * catalogue into website `products` rows.
 *
 *  1. Refreshes pos_medicines from the live POS API (posSync).
 *  2. Skips institutional/clinical items with no retail category home.
 *  3. Classifies everything else into a website category by keyword rules.
 *  4. Matches each product name against frontend/public/product_images/
 *     by normalized-token overlap; falls back to the shared
 *     /placeholder_product.webp when no confident match exists.
 *  5. Upserts into `products`, keyed on pos_medicine_id:
 *       - new POS items  -> INSERT
 *       - already-linked -> UPDATE stock + price (image only backfilled if
 *         currently empty or still the placeholder, so an admin's manually
 *         chosen image is never overwritten)
 *
 * Requires the products.pos_medicine_id unique key — run
 * migrate-pos-products-unique.js first if this errors with "no unique key".
 *
 * Usage: node scripts/import-pos-catalog.js
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const posSync = require('../services/posSync');
const { isExcluded, classifyCategory, buildImageIndex, findBestImageMatch } = require('../utils/posImportRules');

const IMAGES_DIR = path.join(__dirname, '../../frontend/public/product_images');
const PLACEHOLDER = '/placeholder_product.webp';
const BATCH_SIZE = 500;

async function main() {
  console.log('Step 1/4: refreshing pos_medicines from the live POS API...');
  const syncResult = await posSync.syncMedicinesToLocalDB();
  console.log(`  fetched ${syncResult.fetched}, upserted ${syncResult.upserted} (${syncResult.durationMs}ms)`);

  console.log('Step 2/4: loading pos_medicines + image index...');
  const [medicines] = await db.query('SELECT pos_id, name, pos_price, pos_quantity FROM pos_medicines');
  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f));
  const imageIndex = buildImageIndex(imageFiles);
  console.log(`  ${medicines.length} POS medicines, ${imageFiles.length} candidate images`);

  console.log('Step 3/4: classifying + matching...');
  const rows = [];
  let excluded = 0;
  let withImage = 0;
  let withPlaceholder = 0;
  const categoryCounts = {};

  for (const med of medicines) {
    if (isExcluded(med.name)) { excluded++; continue; }

    const category = classifyCategory(med.name);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    const match = findBestImageMatch(med.name, imageIndex);
    const image = match ? `/product_images/${match.file}` : PLACEHOLDER;
    if (match) withImage++; else withPlaceholder++;

    rows.push({
      pos_id: med.pos_id,
      name: med.name,
      category,
      price: med.pos_price,
      stock: med.pos_quantity,
      image,
    });
  }

  console.log(`  included: ${rows.length}, excluded: ${excluded}`);
  console.log(`  with matched image: ${withImage}, with placeholder: ${withPlaceholder}`);
  console.log('  category breakdown:', categoryCounts);

  console.log('Step 4/4: upserting into products...');
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const values = chunk.flatMap(r => [r.name, r.category, r.price, r.image, r.stock, r.pos_id]);

    await db.query(
      `INSERT INTO products (name, category, price, image, stock, pos_medicine_id)
       VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE
         stock = VALUES(stock),
         price = VALUES(price),
         image = IF(image IS NULL OR image = '' OR image = '${PLACEHOLDER}', VALUES(image), image)`,
      values
    );
    upserted += chunk.length;
    console.log(`  upserted ${upserted}/${rows.length}`);
  }

  console.log('\nDone.');
  console.log(`Total products upserted: ${upserted}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
