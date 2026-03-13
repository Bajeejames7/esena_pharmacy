#!/usr/bin/env node

/**
 * Script to fix admin deployment issues
 * This script will:
 * 1. Rebuild the frontend with correct homepage setting
 * 2. Verify the build structure
 * 3. Provide deployment instructions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Admin Deployment Issues...\n');

// Step 1: Verify package.json homepage setting
console.log('1. Checking package.json homepage setting...');
const packageJsonPath = path.join(__dirname, 'frontend', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.homepage === '/') {
  console.log('✅ Homepage is correctly set to "/"');
} else {
  console.log('❌ Homepage is incorrectly set to:', packageJson.homepage);
  console.log('   Please ensure it is set to "/" in frontend/package.json');
  process.exit(1);
}

// Step 2: Clean and rebuild
console.log('\n2. Cleaning previous build...');
const buildPath = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  fs.rmSync(buildPath, { recursive: true, force: true });
  console.log('✅ Previous build cleaned');
}

console.log('\n3. Building frontend...');
try {
  process.chdir(path.join(__dirname, 'frontend'));
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Verify build structure
console.log('\n4. Verifying build structure...');
const buildDir = path.join(__dirname, 'frontend', 'build');
const staticDir = path.join(buildDir, 'static');
const indexHtml = path.join(buildDir, 'index.html');

if (!fs.existsSync(indexHtml)) {
  console.error('❌ index.html not found in build directory');
  process.exit(1);
}

if (!fs.existsSync(staticDir)) {
  console.error('❌ static directory not found in build directory');
  process.exit(1);
}

console.log('✅ Build structure verified');

// Step 4: Check asset paths in index.html
console.log('\n5. Checking asset paths in index.html...');
const indexContent = fs.readFileSync(indexHtml, 'utf8');

// Look for any /admin/ paths (which would be wrong)
if (indexContent.includes('/admin/static/')) {
  console.error('❌ Found /admin/static/ paths in index.html - this indicates the homepage setting is still wrong');
  process.exit(1);
}

// Look for correct root paths
if (indexContent.includes('/static/js/') || indexContent.includes('/static/css/')) {
  console.log('✅ Asset paths are correctly pointing to /static/');
} else {
  console.log('⚠️  Could not verify asset paths - please check index.html manually');
}

console.log('\n🎉 Build verification complete!\n');

console.log('📋 DEPLOYMENT INSTRUCTIONS:');
console.log('==========================');
console.log('1. Upload the entire contents of frontend/build/ to your public_html/ directory');
console.log('2. Ensure the .htaccess file is in the root of public_html/');
console.log('3. Your directory structure should look like:');
console.log('   public_html/');
console.log('   ├── api/                (Your Node/Express API)');
console.log('   ├── static/             (React build assets)');
console.log('   │   ├── css/');
console.log('   │   └── js/');
console.log('   ├── index.html          (React app entry point)');
console.log('   └── .htaccess           (Routing rules)');
console.log('');
console.log('4. After uploading, test these URLs:');
console.log('   - https://esena.co.ke/ (main site)');
console.log('   - https://esena.co.ke/admin/login (admin login)');
console.log('   - https://esena.co.ke/static/js/main.[hash].js (should serve JS, not HTML)');
console.log('');
console.log('5. If you still see 404s, clear your browser cache with Ctrl+F5');
console.log('');
console.log('✨ Your admin panel and main site should now work correctly!');