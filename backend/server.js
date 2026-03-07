const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./config/db");
const { logger, requestLogger } = require("./utils/logger");
const { initializeDatabase } = require("./utils/database");
const { 
  generalLimiter, 
  authLimiter, 
  apiLimiter, 
  helmetConfig, 
  corsOptions, 
  requestSizeLimit, 
  securityHeaders,
  logSecurityEvent 
} = require("./middleware/security");

dotenv.config();

const app = express();

// Security middleware (applied first)
app.use(helmetConfig);
app.use(securityHeaders);
app.use(requestSizeLimit);

// Request logging
app.use(requestLogger);

// CORS with whitelist
app.use(cors(corsOptions));

// Rate limiting
app.use('/api/auth', authLimiter); // Strict rate limiting for auth
app.use('/api', apiLimiter); // API rate limiting
app.use(generalLimiter); // General rate limiting

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving with security headers
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

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

// Test database connection and initialize optimizations
db.query("SELECT 1")
  .then(async () => {
    logger.info("Database connection established successfully");
    
    // Initialize database optimizations
    try {
      await initializeDatabase();
      logger.info("Database optimizations initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize database optimizations", error);
    }
  })
  .catch((err) => {
    logger.error("Database connection failed", err);
  });

// Global error handler with security logging
app.use((err, req, res, next) => {
  // Log security-related errors
  if (err.status === 401 || err.status === 403 || err.name === "UnauthorizedError") {
    logger.security('AUTHENTICATION_FAILURE', {
      error: err.message,
      path: req.path,
      method: req.method
    }, req);
  }
  
  // Log all errors with comprehensive details
  logger.error('Application error occurred', err, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method,
    body: req.method !== 'GET' ? req.body : undefined,
    userId: req.user ? req.user.id : null
  });
  
  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({ 
      error: "Invalid input data", 
      message: "Please check your input and try again"
    });
  }
  
  if (err.name === "UnauthorizedError" || err.status === 401) {
    return res.status(401).json({ 
      error: "Authentication required",
      message: "Please log in to access this resource"
    });
  }
  
  if (err.status === 403) {
    return res.status(403).json({ 
      error: "Access forbidden",
      message: "You don't have permission to access this resource"
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: "File too large",
      message: "The uploaded file exceeds the maximum allowed size"
    });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: "Request too large",
      message: "The request payload is too large"
    });
  }
  
  // Default error response (don't expose internal details)
  res.status(err.status || 500).json({ 
    error: "Internal server error",
    message: "Something went wrong. Please try again later."
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});
