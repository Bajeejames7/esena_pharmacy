const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Root route
app.get(["/", "/api"], (req, res) => {
  res.json({
    success: true,
    project: "Esena Pharmacy API - Simple Test",
    status: "Online",
    timestamp: new Date().toISOString()
  });
});

// Test simple contact route
try {
  console.log("Loading simple contact route...");
  const contactRoute = require("./routes/contact-simple");
  app.use("/contact", contactRoute);
  console.log("✓ Simple contact route loaded successfully");
} catch (error) {
  console.log("✗ Simple contact route failed:", error.message);
}

// Test database connection
app.get("/db-test", async (req, res) => {
  try {
    const db = require("./config/db");
    const [result] = await db.query("SELECT 1 as test");
    res.json({ status: "Database connected", result: result[0] });
  } catch (error) {
    res.status(500).json({ status: "Database connection failed", error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found in simple test" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Simple test server error:', err);
  res.status(500).json({ error: "Simple test server error", message: err.message });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
});

module.exports = app;