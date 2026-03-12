const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Root route that works
app.get(["/", "/api"], (req, res) => {
  res.json({
    success: true,
    project: "Esena Pharmacy API - Debug Mode",
    status: "Online",
    timestamp: new Date().toISOString()
  });
});

// Test each route individually
console.log("=== ROUTE LOADING TEST ===");

// Test 1: Auth route
try {
  console.log("Loading auth route...");
  const authRoute = require("./routes/auth");
  app.use("/auth", authRoute);
  console.log("✓ Auth route loaded successfully");
} catch (error) {
  console.log("✗ Auth route failed:", error.message);
}

// Test 2: Contact route (simplest)
try {
  console.log("Loading contact route...");
  const contactRoute = require("./routes/contact");
  app.use("/contact", contactRoute);
  console.log("✓ Contact route loaded successfully");
} catch (error) {
  console.log("✗ Contact route failed:", error.message);
}

// Test 3: Products route (most complex)
try {
  console.log("Loading products route...");
  const productsRoute = require("./routes/products");
  app.use("/products", productsRoute);
  console.log("✓ Products route loaded successfully");
} catch (error) {
  console.log("✗ Products route failed:", error.message);
  console.log("Stack:", error.stack);
}

// Test 4: Orders route
try {
  console.log("Loading orders route...");
  const ordersRoute = require("./routes/orders");
  app.use("/orders", ordersRoute);
  console.log("✓ Orders route loaded successfully");
} catch (error) {
  console.log("✗ Orders route failed:", error.message);
}

// Test 5: Appointments route
try {
  console.log("Loading appointments route...");
  const appointmentsRoute = require("./routes/appointments");
  app.use("/appointments", appointmentsRoute);
  console.log("✓ Appointments route loaded successfully");
} catch (error) {
  console.log("✗ Appointments route failed:", error.message);
}

// Test 6: Blogs route
try {
  console.log("Loading blogs route...");
  const blogsRoute = require("./routes/blogs");
  app.use("/blogs", blogsRoute);
  console.log("✓ Blogs route loaded successfully");
} catch (error) {
  console.log("✗ Blogs route failed:", error.message);
}

// Test 7: Dashboard route
try {
  console.log("Loading dashboard route...");
  const dashboardRoute = require("./routes/dashboard");
  app.use("/admin/dashboard", dashboardRoute);
  console.log("✓ Dashboard route loaded successfully");
} catch (error) {
  console.log("✗ Dashboard route failed:", error.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found in debug mode" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Debug server error:', err);
  res.status(500).json({ error: "Debug server error", message: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log("=== ROUTE LOADING COMPLETE ===");
});

module.exports = app;