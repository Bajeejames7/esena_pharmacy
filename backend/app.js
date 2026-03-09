#!/usr/bin/env node

/**
 * cPanel Node.js App Entry Point
 * This file is required for cPanel Node.js app setup
 */

const app = require('./server.js');

// Export the app for cPanel
module.exports = app;