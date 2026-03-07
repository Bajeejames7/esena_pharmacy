const { logger } = require('../utils/logger');
const db = require('../config/db');

/**
 * Audit middleware for tracking admin operations
 * Implements Requirements 30.1, 30.2, 30.3, 30.4, 30.5, 30.6
 */

// Create audit logs table if it doesn't exist
const createAuditTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id INT,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_resource (resource_type, resource_id),
        INDEX idx_timestamp (timestamp)
      )
    `);
  } catch (error) {
    logger.error('Failed to create audit_logs table', error);
  }
};

// Initialize audit table
createAuditTable();

// Store audit log in database
const storeAuditLog = async (auditData) => {
  try {
    await db.query(`
      INSERT INTO audit_logs 
      (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      auditData.userId,
      auditData.action,
      auditData.resourceType,
      auditData.resourceId,
      JSON.stringify(auditData.oldValues),
      JSON.stringify(auditData.newValues),
      auditData.ipAddress,
      auditData.userAgent
    ]);
  } catch (error) {
    logger.error('Failed to store audit log in database', error);
  }
};

// Audit middleware factory
const createAuditMiddleware = (resourceType) => {
  return (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only audit successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const action = getActionFromMethod(req.method, req.path);
        const resourceId = extractResourceId(req, data);
        
        const auditData = {
          userId: req.user ? req.user.userId : null,
          action,
          resourceType,
          resourceId,
          oldValues: req.originalData || null,
          newValues: req.method !== 'DELETE' ? data : null,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        };
        
        // Store in database
        storeAuditLog(auditData);
        
        // Log to file
        logger.audit(`${action} ${resourceType}`, {
          resourceId,
          userId: auditData.userId,
          changes: {
            old: auditData.oldValues,
            new: auditData.newValues
          }
        }, req);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Extract action from HTTP method and path
const getActionFromMethod = (method, path) => {
  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    case 'GET':
      return 'READ';
    default:
      return 'UNKNOWN';
  }
};

// Extract resource ID from request or response
const extractResourceId = (req, responseData) => {
  // Try to get ID from URL parameters
  if (req.params.id) {
    return parseInt(req.params.id);
  }
  
  // Try to get ID from response data
  if (responseData && responseData.id) {
    return responseData.id;
  }
  
  // Try to get ID from response data (nested)
  if (responseData && responseData.data && responseData.data.id) {
    return responseData.data.id;
  }
  
  return null;
};

// Middleware to capture original data before updates
const captureOriginalData = (resourceType) => {
  return async (req, res, next) => {
    if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
      const resourceId = req.params.id;
      if (resourceId) {
        try {
          let query;
          switch (resourceType) {
            case 'product':
              query = 'SELECT * FROM products WHERE id = ?';
              break;
            case 'order':
              query = 'SELECT * FROM orders WHERE id = ?';
              break;
            case 'appointment':
              query = 'SELECT * FROM appointments WHERE id = ?';
              break;
            default:
              query = null;
          }
          
          if (query) {
            const [rows] = await db.query(query, [resourceId]);
            req.originalData = rows[0] || null;
          }
        } catch (error) {
          logger.error('Failed to capture original data for audit', error);
        }
      }
    }
    next();
  };
};

// Specific audit middleware for different resources
const auditProduct = createAuditMiddleware('product');
const auditOrder = createAuditMiddleware('order');
const auditAppointment = createAuditMiddleware('appointment');

// Combined middleware for products
const productAudit = [
  captureOriginalData('product'),
  auditProduct
];

// Combined middleware for orders
const orderAudit = [
  captureOriginalData('order'),
  auditOrder
];

// Combined middleware for appointments
const appointmentAudit = [
  captureOriginalData('appointment'),
  auditAppointment
];

// Get audit logs (for admin dashboard)
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const [logs] = await db.query(`
      SELECT 
        al.*,
        u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM audit_logs');
    const total = countResult[0].total;
    
    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Failed to retrieve audit logs', error);
    res.status(500).json({
      error: 'Failed to retrieve audit logs',
      message: 'Unable to fetch audit trail data'
    });
  }
};

module.exports = {
  productAudit,
  orderAudit,
  appointmentAudit,
  getAuditLogs,
  createAuditMiddleware,
  captureOriginalData
};