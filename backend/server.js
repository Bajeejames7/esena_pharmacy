const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/contact", require("./routes/contact"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Esena Pharmacy API is running" });
});

// Test database connection
db.query("SELECT 1")
  .then(() => {
    console.log("Database connection established successfully");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  
  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({ 
      error: "Validation Error", 
      details: err.message 
    });
  }
  
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ 
      error: "Unauthorized" 
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error" 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
