#!/usr/bin/env node

/**
 * cPanel Node.js App Startup Script
 * Alternative entry point for cPanel hosting
 */

const path = require('path');

// Set the working directory to the backend folder
process.chdir(__dirname);

// Load environment variables
require('dotenv').config();

// Start the application
const app = require('./server.js');

// For cPanel, we might need to listen on a specific port
const PORT = process.env.PORT || process.env.CPANEL_PORT || 5000;

if (!module.parent) {
  app.listen(PORT, () => {
    console.log(`Esena Pharmacy API running on port ${PORT}`);
  });
}

module.exports = app;