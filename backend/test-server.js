#!/usr/bin/env node

/**
 * Minimal test server to debug Passenger issues
 */

const express = require("express");
const app = express();

// Basic middleware
app.use(express.json());

// Test routes that handle both root and /api paths
app.get("/", (req, res) => {
  res.json({ 
    message: "Esena Pharmacy API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    path: req.path,
    url: req.url
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "Esena Pharmacy API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    path: req.path,
    url: req.url
  });
});

app.get("/api/", (req, res) => {
  res.json({ 
    message: "Esena Pharmacy API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    path: req.path,
    url: req.url
  });
});

app.get("/products", (req, res) => {
  res.json({
    message: "Products endpoint working",
    products: [],
    timestamp: new Date().toISOString(),
    note: "This is a test response - database not connected yet"
  });
});

app.get("/test", (req, res) => {
  res.json({ 
    status: "API working", 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 'not set',
    path: req.path,
    url: req.url
  });
});

app.get("/env-test", (req, res) => {
  res.json({
    status: "Environment test",
    db_host: process.env.DB_HOST || 'not set',
    db_name: process.env.DB_NAME || 'not set',
    node_env: process.env.NODE_ENV || 'not set',
    port: process.env.PORT || 'not set',
    path: req.path,
    url: req.url
  });
});

// Temporary admin routes for testing
app.get("/admin/test", (req, res) => {
  res.json({ 
    message: "Admin test route working from test-server.js", 
    timestamp: new Date().toISOString(),
    path: req.path,
    url: req.url
  });
});

app.get("/admin/dashboard/stats", (req, res) => {
  res.json({
    message: "Dashboard stats endpoint (temporary mock)",
    pendingOrders: 5,
    pendingAppointments: 3,
    productsInStock: 25,
    totalRevenue: 1500.00,
    note: "This is a temporary mock response from test-server.js",
    timestamp: new Date().toISOString()
  });
});

app.get("/admin/orders", (req, res) => {
  res.json({
    message: "Orders endpoint (temporary mock)",
    orders: [],
    note: "This is a temporary mock response from test-server.js",
    timestamp: new Date().toISOString()
  });
});

app.get("/admin/appointments", (req, res) => {
  res.json({
    message: "Appointments endpoint (temporary mock)",
    appointments: [],
    note: "This is a temporary mock response from test-server.js",
    timestamp: new Date().toISOString()
  });
});

// Add a catch-all route to see what requests are coming in
app.get("*", (req, res) => {
  res.json({
    message: "Catch-all route",
    path: req.path,
    url: req.url,
    method: req.method,
    headers: req.headers,
    timestamp: new Date().toISOString(),
    note: "STILL USING test-server.js - Need to update .htaccess to use server.js"
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