const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult, sanitizeBody } = require('express-validator');

/**
 * Security middleware configuration
 * Implements Requirements 26.4, 26.5, 26.7, 26.9
 */

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json({ error: message });
    }
  });
};

// General rate limiting - 100 requests per 15 minutes
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100,
  'Too many requests from this IP, please try again later'
);

// Strict rate limiting for auth endpoints - 5 attempts per 15 minutes
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many authentication attempts, please try again later'
);

// API rate limiting - 1000 requests per hour for authenticated users
const apiLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  1000,
  'API rate limit exceeded, please try again later'
);

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Required for Tailwind CSS
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for React development
        "'unsafe-eval'" // Required for React development
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://api.whatsapp.com"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration with origin whitelist
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', // React development server
      'http://localhost:3001', // Alternative development port
      'http://127.0.0.1:3000',
      'https://esena-pharmacy.com', // Production domain (example)
      'https://www.esena-pharmacy.com' // Production www domain (example)
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Input sanitization middleware
const sanitizeInput = [
  // Sanitize common string fields
  body('name').optional().trim().escape(),
  body('email').optional().normalizeEmail().escape(),
  body('phone').optional().trim().escape(),
  body('message').optional().trim().escape(),
  body('description').optional().trim().escape(),
  body('category').optional().trim().escape(),
  body('service').optional().trim().escape(),
  body('address').optional().trim().escape(),
  body('city').optional().trim().escape(),
  body('state').optional().trim().escape(),
  body('zipCode').optional().trim().escape(),
  
  // Sanitize numeric fields
  body('price').optional().isFloat({ min: 0 }).toFloat(),
  body('stock').optional().isInt({ min: 0 }).toInt(),
  body('quantity').optional().isInt({ min: 1 }).toInt(),
  
  // Validation error handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Input validation failed:', {
        ip: req.ip,
        path: req.path,
        errors: errors.array()
      });
      return res.status(400).json({
        error: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

// File upload security validation
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }
  
  const files = req.files || [req.file];
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ];
  
  for (const file of files) {
    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      console.warn(`Invalid file type uploaded: ${file.mimetype} from IP: ${req.ip}`);
      return res.status(400).json({
        error: 'Invalid file type. Only JPEG, PNG, WebP, MP4, and WebM files are allowed.'
      });
    }
    
    // Check file size (5MB for images, 50MB for videos)
    const maxSize = file.mimetype.startsWith('image/') ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      console.warn(`File too large uploaded: ${file.size} bytes from IP: ${req.ip}`);
      return res.status(400).json({
        error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`
      });
    }
  }
  
  next();
};

// Request size limiting middleware
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 100 * 1024 * 1024; // 100MB max request size
  
  if (contentLength > maxSize) {
    console.warn(`Request too large: ${contentLength} bytes from IP: ${req.ip}`);
    return res.status(413).json({
      error: 'Request entity too large'
    });
  }
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Log security events
const logSecurityEvent = (event, details, req) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method,
    details
  };
  
  console.warn('Security Event:', JSON.stringify(logEntry));
  
  // In production, you might want to send this to a security monitoring service
  // or store in a dedicated security log file
};

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  helmetConfig,
  corsOptions,
  sanitizeInput,
  validateFileUpload,
  requestSizeLimit,
  securityHeaders,
  logSecurityEvent
};