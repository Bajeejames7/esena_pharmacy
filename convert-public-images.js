/**
 * One-time script to convert public images to WebP
 * Run: node convert-public-images.js
 */
const sharp = require('./backend/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'frontend/public');

// Images to convert (skip favicons, icons, logos used in manifest/PWA)
const toConvert = [
  'branding1.1.jpeg',
  'branding1.2.jpeg',
  'branding2.1.jpeg',
  'branding2.2.jpeg',
  'branding3.1.jpeg',
  'branding3.2.jpeg',
  'branding4.1.jpeg',
  'branding4.2.jpeg',
  'branding4.3.jpeg',
  'quality_medication.jpg',
  'expert_consultations.png',
  'fast_delivery.png',
  'pharmacist_consulation.png',
  'pharmacist_support.png',
  'same_day_delivery.png',
  'pain_relief.png',
  'cough_&_flu.png',
  'vitamins_&_supplements.png',
  'skin_care.png',
  'baby_care.png',
  'womens_health.png',
  'diabetis.png',
  'digestive_health.png',
  'mpesa.png',
  'cart.png',
  'cookie_image.png',
  'new_logo.png',
  'full_logo.jpeg',
];

(async () => {
  for (const file of toConvert) {
    const src = path.join(publicDir, file);
    const webpName = path.basename(file, path.extname(file)) + '.webp';
    const dest = path.join(publicDir, webpName);

    if (!fs.existsSync(src)) {
      console.log(`SKIP (not found): ${file}`);
      continue;
    }

    try {
      const before = fs.statSync(src).size;
      await sharp(src)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(dest);
      const after = fs.statSync(dest).size;
      const saving = (((before - after) / before) * 100).toFixed(1);
      console.log(`✅ ${file} → ${webpName}  (${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB, -${saving}%)`);
    } catch (e) {
      console.error(`❌ ${file}: ${e.message}`);
    }
  }
  console.log('\nDone. Original files kept — delete them manually after verifying.');
})();
