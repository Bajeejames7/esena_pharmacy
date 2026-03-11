#!/usr/bin/env node

/**
 * Minimal test server to debug Passenger issues
 */

const express = require("express");
const app = express();

// Basic middleware
app.use(express.json());

// Test routes that won't crash
app.get("/", (req, res) => {
  res.json({ 
    message: "Esena Pharmacy API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/test", (req, res) => {
  res.json({ 
    status: "API working", 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 'not set'
  });
});

app.get("/env-test", (req, res) => {
  res.json({
    status: "Environment test",
    db_host: process.env.DB_HOST || 'not set',
    db_name: process.env.DB_NAME || 'not set',
    node_env: process.env.NODE_ENV || 'not set',
    port: process.env.PORT || 'not set'
  });
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });
}

module.exports = app;