// Test script to identify which route is failing
const express = require("express");
const app = express();

console.log("Testing route imports...");

const routes = [
  { name: "auth", path: "./routes/auth" },
  { name: "products", path: "./routes/products" },
  { name: "orders", path: "./routes/orders" },
  { name: "appointments", path: "./routes/appointments" },
  { name: "contact", path: "./routes/contact" },
  { name: "blogs", path: "./routes/blogs" },
  { name: "dashboard", path: "./routes/dashboard" }
];

for (const route of routes) {
  try {
    console.log(`Testing ${route.name} route...`);
    const routeModule = require(route.path);
    console.log(`✓ ${route.name} route loaded successfully`);
  } catch (error) {
    console.log(`✗ ${route.name} route failed:`, error.message);
    console.log("Stack:", error.stack);
  }
}

console.log("Route testing complete.");