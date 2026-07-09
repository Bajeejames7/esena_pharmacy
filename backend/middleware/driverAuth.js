/**
 * Driver Authentication Middleware
 * Verifies JWT tokens for driver access
 */

const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const driverAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'driver') {
      return res.status(403).json({ error: 'Access denied. Driver role required.' });
    }

    req.driver = decoded;
    next();
  } catch (err) {
    logger.error('Driver auth error', { error: err.message });
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = driverAuth;
