const fs = require('fs');
const path = require('path');
const os = require('os');

const logsDir = path.join(__dirname, '../logs');

// --- SETUP: ensure logs dir exists and test write permissions ---
let canWriteLogs = false;
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  // Test write
  const testFile = path.join(logsDir, '.write-test');
  fs.writeFileSync(testFile, 'ok');
  fs.unlinkSync(testFile);
  canWriteLogs = true;
  console.log('[Logger] Log directory writable:', logsDir);
} catch (err) {
  console.error('[Logger] WARNING: Cannot write to logs directory:', logsDir, err.message);
  console.error('[Logger] Logging to console only.');
}

const LOG_LEVELS = { ERROR: 'ERROR', WARN: 'WARN', INFO: 'INFO', DEBUG: 'DEBUG', SECURITY: 'SECURITY', AUDIT: 'AUDIT' };

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const createLogEntry = (level, message, metadata = {}) => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  ...metadata,
  pid: process.pid,
  hostname: os.hostname()
});

// Synchronous write so errors are never silently dropped
const writeLog = (filename, entry) => {
  if (!canWriteLogs) return;
  try {
    fs.appendFileSync(path.join(logsDir, filename), JSON.stringify(entry) + '\n');
  } catch (err) {
    console.error('[Logger] Failed to write log file:', filename, err.message);
  }
};

const logger = {
  error: (message, error = null, metadata = {}) => {
    const entry = createLogEntry(LOG_LEVELS.ERROR, message, {
      ...metadata,
      error: error ? { message: error.message, stack: error.stack, name: error.name } : null
    });
    console.error('ERROR:', JSON.stringify(entry));
    writeLog(`error-${getCurrentDate()}.log`, entry);
    writeLog(`application-${getCurrentDate()}.log`, entry);
  },

  warn: (message, metadata = {}) => {
    const entry = createLogEntry(LOG_LEVELS.WARN, message, metadata);
    console.warn('WARN:', JSON.stringify(entry));
    writeLog(`application-${getCurrentDate()}.log`, entry);
  },

  info: (message, metadata = {}) => {
    const entry = createLogEntry(LOG_LEVELS.INFO, message, metadata);
    console.log('INFO:', JSON.stringify(entry));
    writeLog(`application-${getCurrentDate()}.log`, entry);
  },

  debug: (message, metadata = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      const entry = createLogEntry(LOG_LEVELS.DEBUG, message, metadata);
      console.log('DEBUG:', JSON.stringify(entry));
      writeLog(`application-${getCurrentDate()}.log`, entry);
    }
  },

  security: (event, details = {}, req = null) => {
    const entry = createLogEntry(LOG_LEVELS.SECURITY, `Security event: ${event}`, {
      event, details,
      ip: req ? req.ip : null,
      userAgent: req ? req.get('User-Agent') : null,
      path: req ? req.path : null,
      method: req ? req.method : null
    });
    console.warn('SECURITY:', JSON.stringify(entry));
    writeLog(`security-${getCurrentDate()}.log`, entry);
    writeLog(`application-${getCurrentDate()}.log`, entry);
  },

  audit: (action, details = {}, req = null) => {
    const entry = createLogEntry(LOG_LEVELS.AUDIT, `Audit: ${action}`, {
      action, details,
      userId: req && req.user ? req.user.id : null,
      ip: req ? req.ip : null,
      path: req ? req.path : null,
      method: req ? req.method : null
    });
    console.log('AUDIT:', JSON.stringify(entry));
    writeLog(`audit-${getCurrentDate()}.log`, entry);
    writeLog(`application-${getCurrentDate()}.log`, entry);
  },

  authFailure: (reason, details = {}, req = null) => {
    const entry = createLogEntry(LOG_LEVELS.SECURITY, `Auth failure: ${reason}`, {
      reason, details,
      ip: req ? req.ip : null,
      userAgent: req ? req.get('User-Agent') : null,
      path: req ? req.path : null
    });
    console.warn('AUTH_FAILURE:', JSON.stringify(entry));
    writeLog(`security-${getCurrentDate()}.log`, entry);
    writeLog(`application-${getCurrentDate()}.log`, entry);
  }
};

// Write a startup entry immediately so you can confirm logging works on deploy
const startupEntry = createLogEntry(LOG_LEVELS.INFO, 'Server starting up', {
  nodeVersion: process.version,
  env: process.env.NODE_ENV || 'production',
  logsDir,
  canWriteLogs
});
console.log('STARTUP:', JSON.stringify(startupEntry));
writeLog(`application-${getCurrentDate()}.log`, startupEntry);

// Log rotation: delete files older than 30 days
const rotateLogFiles = () => {
  if (!canWriteLogs) return;
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  try {
    fs.readdirSync(logsDir).forEach(file => {
      const filePath = path.join(logsDir, file);
      try {
        const { mtime } = fs.statSync(filePath);
        if (Date.now() - mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log('[Logger] Rotated old log:', file);
        }
      } catch (_) {}
    });
  } catch (_) {}
};
setInterval(rotateLogFiles, 24 * 60 * 60 * 1000);

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  next();
};

module.exports = { logger, requestLogger, LOG_LEVELS, logsDir, canWriteLogs };
