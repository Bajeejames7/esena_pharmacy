// Debug server to identify the exact error
console.log('Node.js version:', process.version);
console.log('Starting debug server...');

try {
  // Test basic requires
  console.log('Testing basic requires...');
  const express = require("express");
  console.log('✓ Express loaded');
  
  const cors = require("cors");
  console.log('✓ CORS loaded');
  
  const dotenv = require("dotenv");
  console.log('✓ Dotenv loaded');
  
  // Test problematic requires
  console.log('Testing potentially problematic requires...');
  
  try {
    const helmet = require("helmet");
    console.log('✓ Helmet loaded');
  } catch (err) {
    console.log('✗ Helmet failed:', err.message);
  }
  
  try {
    const rateLimit = require("express-rate-limit");
    console.log('✓ Rate limit loaded');
  } catch (err) {
    console.log('✗ Rate limit failed:', err.message);
  }
  
  try {
    const fileType = require("file-type");
    console.log('✓ File type loaded');
  } catch (err) {
    console.log('✗ File type failed:', err.message);
  }
  
  try {
    const mysql = require("mysql2");
    console.log('✓ MySQL2 loaded');
  } catch (err) {
    console.log('✗ MySQL2 failed:', err.message);
  }
  
  // Test environment variables
  console.log('Testing environment...');
  dotenv.config();
  console.log('PORT:', process.env.PORT || 'not set');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  
  // Create basic server
  const app = express();
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Debug server working!',
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    });
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✓ Debug server running on port ${PORT}`);
    console.log('All tests passed!');
  });
  
} catch (error) {
  console.error('✗ Fatal error:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}