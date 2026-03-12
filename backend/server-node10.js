// Node 10 compatible server
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic security headers (without helmet)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Status route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    project: "Esena Pharmacy API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    status: "Online",
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/auth",
      products: "/products", 
      orders: "/orders",
      appointments: "/appointments",
      contact: "/contact",
      blogs: "/blogs",
      admin: "/admin/dashboard"
    }
  });
});

// Test route
app.get("/test", (req, res) => {
  res.json({ 
    status: "API working", 
    nodeVersion: process.version,
    timestamp: new Date().toISOString() 
  });
});

// Basic routes (you'll need to add these back gradually)
try {
  app.use("/auth", require("./routes/auth"));
  console.log('✓ Auth routes loaded');
} catch (err) {
  console.log('✗ Auth routes failed:', err.message);
}

try {
  app.use("/products", require("./routes/products"));
  console.log('✓ Products routes loaded');
} catch (err) {
  console.log('✗ Products routes failed:', err.message);
}

// Add other routes similarly...

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requested_path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ 
    error: "Internal server error",
    message: "Something went wrong. Please try again later."
  });
});

const PORT = process.env.PORT || 5000;

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Node.js version: ${process.version}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;