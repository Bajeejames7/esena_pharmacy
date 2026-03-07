const fs = require('fs');
const path = require('path');

/**
 * Comprehensive logging utility
 * Implements Requirements 24.1, 24.4, 24.7, 30.1, 30.2, 30.3, 30.4, 30.5, 30.6
 */

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  SECURITY: 'SECURITY',
  AUDIT: 'AUDIT'
};

// Create log entry
const createLogEntry = (level, message, metadata = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
    pid: process.pid,
    hostname: require('os').hostname()
  };
};

// Write log to file
const writeLogToFile = (filename, logEntry) => {
  const logLine = JSON.stringify(logEntry) + '\n';
  const logPath = path.join(logsDir, filename);
  
  fs.appendFile(logPath, logLine, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

// Get current date for log file naming
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Main logging functions
const logger = {
  // Error logging
  error: (message, error = null, metadata = {}) => {
    const logEntry = createLogEntry(LOG_LEVELS.ERROR, message, {
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    });
    
    console.error('ERROR:', JSON.stringify(logEntry, null, 2));
    writeLogToFile(`error-${getCurrentDate()}.log`, logEntry);
  },

  // Warning logging
  warn: (message, metadata = {}) => {
    const logEntry = createLogEntry(LOG_LEVELS.WARN, message, metadata);
    console.warn('WARN:', JSON.stringify(logEntry));
    writeLogToFile(`application-${getCurrentDate()}.log`, logEntry);
  },

  // Info logging
  info: (message, metadata = {}) => {
    const logEntry = createLogEntry(LOG_LEVELS.INFO, message, metadata);
    console.log('INFO:', JSON.stringify(logEntry));
    writeLogToFile(`application-${getCurrentDate()}.log`, logEntry);
  },

  // Debug logging (only in development)
  debug: (message, metadata = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = createLogEntry(LOG_LEVELS.DEBUG, message, metadata);
      console.log('DEBUG:', JSON.stringify(logEntry));
    }
  },

  // Security event logging
  security: (event, details = {}, req = null) => {
    const logEntry = createLogEntry(LOG_LEVELS.SECURITY, `Security event: ${event}`, {
      event,
      details,
      ip: req ? req.ip : null,
      userAgent: req ? req.get('User-Agent') : null,
      path: req ? req.path : null,
      method: req ? req.method : null,
      headers: req ? req.headers : null
    });
    
    console.warn('SECURITY:', JSON.stringify(logEntry));
    writeLogToFile(`security-${getCurrentDate()}.log`, logEntry);
  },

  // Audit logging for admin operations
  audit: (action, details = {}, req = null) => {
    const logEntry = createLogEntry(LOG_LEVELS.AUDIT, `Audit: ${action}`, {
      action,
      details,
      userId: req && req.user ? req.user.id : null,
      userRole: req && req.user ? req.user.role : null,
      ip: req ? req.ip : null,
      userAgent: req ? req.get('User-Agent') : null,
      path: req ? req.path : null,
      method: req ? req.method : null,
      timestamp: new Date().toISOString()
    });
    
    console.log('AUDIT:', JSON.stringify(logEntry));
    writeLogToFile(`audit-${getCurrentDate()}.log`, logEntry);
  },

  // Authentication failure logging
  authFailure: (reason, details = {}, req = null) => {
    const logEntry = createLogEntry(LOG_LEVELS.SECURITY, `Authentication failure: ${reason}`, {
      reason,
      details,
      ip: req ? req.ip : null,
      userAgent: req ? req.get('User-Agent') : null,
      path: req ? req.path : null,
      method: req ? req.method : null,
      attemptedCredentials: details.email || details.username || 'unknown'
    });
    
    console.warn('AUTH_FAILURE:', JSON.stringify(logEntry));
    writeLogToFile(`security-${getCurrentDate()}.log`, logEntry);
  }
};

// Log rotation utility (simple implementation)
const rotateLogFiles = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const now = Date.now();
  
  fs.readdir(logsDir, (err, files) => {
    if (err) {
      logger.error('Failed to read logs directory for rotation', err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error(`Failed to delete old log file: ${file}`, err);
            } else {
              logger.info(`Rotated old log file: ${file}`);
            }
          });
        }
      });
    });
  });
};

// Run log rotation daily
setInterval(rotateLogFiles, 24 * 60 * 60 * 1000); // 24 hours

// Middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('Content-Length'),
    userId: req.user ? req.user.id : null
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level]('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user ? req.user.id : null
    });
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger,
  LOG_LEVELS
};