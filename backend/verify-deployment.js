#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Run this to verify your cPanel setup is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying cPanel Node.js deployment setup...\n');

// Check if we're in the correct directory
const currentDir = process.cwd();
console.log(`📁 Current directory: ${currentDir}`);

// Check for required files
const requiredFiles = [
  'server.js',
  'package.json',
  'startup.js',
  '.env'
];

console.log('\n📋 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(currentDir, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check package.json main entry
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`\n📦 Package.json main entry: ${packageJson.main}`);
  
  if (packageJson.main === 'server.js') {
    console.log('✅ Main entry is correct');
  } else {
    console.log('⚠️  Main entry should be "server.js" for cPanel');
  }
} catch (error) {
  console.log('❌ Could not read package.json');
}

// Check environment variables
console.log('\n🔧 Environment variables:');
require('dotenv').config();

const requiredEnvVars = [
  'DB_HOST',
  'DB_USER', 
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

requiredEnvVars.forEach(envVar => {
  const exists = process.env[envVar] ? true : false;
  console.log(`  ${exists ? '✅' : '❌'} ${envVar}`);
});

console.log('\n🚀 Deployment checklist:');
console.log('  1. Ensure PassengerAppRoot points to this backend directory');
console.log('  2. Ensure PassengerBaseURI is set to "/api"');
console.log('  3. Ensure Node.js version is compatible (14+ recommended)');
console.log('  4. Run "npm install" in cPanel terminal');
console.log('  5. Test with: curl https://esena.co.ke/api/');

console.log('\n✨ Verification complete!');