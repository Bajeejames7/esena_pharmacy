const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./config/db");
const { logger, requestLogger } = require("./utils/logger");
const { initializeDatabase } = require("./utils/database");
const { createAuditTable } = require("./middleware/audit");
const { 
  generalLimiter, 
  authLimiter, 
  apiLimiter, 
  corsOptions, 
  requestSizeLimit 
} = require("./middleware/security");

// Load environment variables
dotenv.config();

const app = express();

// --- STARTUP LOGS ---
console.log('--- Esena Backend Starting ---');
console.log('NODE_ENV:', process.env.NODE_ENV || 'production');

// 1. GLOBAL MIDDLEWARE
app.use(requestSizeLimit);
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. TRAILING SLASH HANDLER
app.use((req, res, next) => {
  if (req.path !== '/' && req.path !== '' && req.path.endsWith('/')) {
    const newPath = req.path.slice(0, -1);
    const query = req.url.includes('?') ? req.url.substring(req.path.length) : '';
    return res.redirect(301, newPath + query);
  }
  next();
});

// 3. ROOT API STATUS ROUTE
app.get(["/", "/api"], (req, res) => {
  res.status(200).json({
    success: true,
    project: "Esena Pharmacy API",
    status: "Online",
    timestamp: new Date().toISOString()
  });
});

// 4. RATE LIMITING
app.use('/auth', authLimiter);
app.use('/', apiLimiter);
app.use(generalLimiter);

// 5. STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 6. ROUTES - Dual path support for cPanel deployment
app.use(["/auth", "/api/auth"], require("./routes/auth"));
app.use(["/products", "/api/products"], require("./routes/products"));
app.use(["/orders", "/api/orders", "/admin/orders", "/api/admin/orders"], require("./routes/orders"));
app.use(["/appointments", "/api/appointments", "/admin/appointments", "/api/admin/appointments"], require("./routes/appointments"));
app.use(["/contact", "/api/contact"], require("./routes/contact"));
app.use(["/blogs", "/api/blogs"], require("./routes/blogs"));
app.use(["/admin/dashboard", "/api/admin/dashboard"], require("./routes/dashboard"));
app.use(["/fix-auth", "/api/fix-auth"], require("./routes/fix-auth"));

// 6.1. EXPLICIT ADMIN ROUTES (Fallback for cPanel routing issues)
// These handle the exact paths the frontend is calling
app.use("/api/admin/orders", require("./routes/orders"));
app.use("/api/admin/appointments", require("./routes/appointments"));
app.use("/api/admin/dashboard", require("./routes/dashboard"));

// 7. DEBUG ROUTES (Remove after fixing)
app.get("/debug/routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes, message: "Available routes" });
});

// 8. DB TEST ROUTE
app.get("/db-test", async (req, res) => {
  try {
    const [result] = await db.query("SELECT 1 as test");
    res.json({ status: "Database connected", result: result[0] });
  } catch (error) {
    res.status(500).json({ status: "Database connection failed", error: error.message });
  }
});

// 9. BACKGROUND TASKS (Lazy Loading)
const startBackgroundTasks = async () => {
  try {
    logger.info("Starting background database maintenance...");
    await createAuditTable();
    await initializeDatabase();
    logger.info("Background tasks completed successfully");
  } catch (error) {
    logger.error("Background task error:", error.message);
  }
};

// Verify DB and Start Tasks
db.query("SELECT 1")
  .then(() => {
    logger.info("Database connection verified.");
    setTimeout(startBackgroundTasks, 5000); // 5s delay to let server settle
  })
  .catch((err) => {
    logger.error("Initial Database connection failed", err);
  });

// 10. ERROR HANDLING
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  logger.error('Application error', err);
  res.status(err.status || 500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'production' ? "Something went wrong." : err.message
  });
});

// 11. DYNAMIC LISTEN LOGIC (The "Anti-Lock" Fix)
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log(`Server listening on ${bind}`);
});

// Catch the EADDRINUSE error so the app doesn't crash the selector
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is busy. Retrying on a dynamic port...`);
    setTimeout(() => {
      server.close();
      app.listen(0); // This tells the OS to pick ANY free port
    }, 1000);
  }
});

module.exports = app;