const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dirs = [
  path.join(__dirname, 'uploads', 'products'),
  path.join(__dirname, '..', 'frontend', 'product_images'),
  path.join(__dirname, '..', 'frontend', 'public', 'product_images'),
  path.join(__dirname, '..', 'frontend', 'build', 'product_images')
];

const rotateImage = async (filePath) => {
  const tempPath = `${filePath}.tmp`;
  try {
    await sharp(filePath)
      .rotate(90)
      .webp({ quality: 82 })
      .toFile(tempPath);

    fs.renameSync(tempPath, filePath);
    console.log('Corrected:', path.relative(process.cwd(), filePath));
  } catch (error) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error('Failed:', path.relative(process.cwd(), filePath), error.message);
  }
};

const main = async () => {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir)
      .filter(file => file.toLowerCase().endsWith('.webp'))
      .sort();

    for (const file of files) {
      await rotateImage(path.join(dir, file));
    }
  }
};

main().then(() => console.log('Orientation normalization complete.'));
