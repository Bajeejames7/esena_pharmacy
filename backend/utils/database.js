const db = require('../config/db');
const { logger } = require('./logger');

/**
 * Database utilities for transaction management and performance optimization
 * Implements Requirements 27.4, 27.5, 27.7
 */

/**
 * Execute a function within a database transaction
 * Automatically handles commit/rollback
 */
const withTransaction = async (callback) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    logger.debug('Database transaction started');
    
    const result = await callback(connection);
    
    await connection.commit();
    logger.debug('Database transaction committed');
    
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('Database transaction rolled back', error, {
      operation: 'transaction'
    });
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Create database indexes for performance optimization
 * Implements Requirement 27.7
 */
const createIndexes = async () => {
  try {
    logger.info('Creating database indexes for performance optimization');

    // Orders table indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(token)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)
    `);

    // Appointments table indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_token ON appointments(token)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(email)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service)
    `);

    // Products table indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock)
    `);

    // Order items table indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)
    `);

    // Contacts table indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at)
    `);

    // Users table indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `);

    // Audit logs table indexes (if exists)
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)
    `);

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Failed to create database indexes', error);
    throw error;
  }
};

/**
 * Analyze query performance
 */
const analyzeQuery = async (query, params = []) => {
  try {
    const explainQuery = `EXPLAIN ${query}`;
    const [results] = await db.query(explainQuery, params);
    
    logger.debug('Query analysis results', {
      query: query.substring(0, 100) + '...',
      analysis: results
    });
    
    return results;
  } catch (error) {
    logger.error('Failed to analyze query', error, { query });
    throw error;
  }
};

/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
  try {
    const stats = {};

    // Table row counts
    const tables = ['orders', 'appointments', 'products', 'order_items', 'contacts', 'users'];
    
    for (const table of tables) {
      try {
        const [result] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result[0].count;
      } catch (error) {
        logger.warn(`Failed to get count for table ${table}`, { error: error.message });
        stats[table] = 'unknown';
      }
    }

    // Database size
    try {
      const [sizeResult] = await db.query(`
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);
      stats.database_size_mb = sizeResult[0].size_mb;
    } catch (error) {
      logger.warn('Failed to get database size', { error: error.message });
      stats.database_size_mb = 'unknown';
    }

    // Index usage
    try {
      const [indexResult] = await db.query(`
        SELECT 
          table_name,
          index_name,
          cardinality
        FROM information_schema.statistics 
        WHERE table_schema = DATABASE()
        ORDER BY table_name, index_name
      `);
      stats.indexes = indexResult;
    } catch (error) {
      logger.warn('Failed to get index information', { error: error.message });
      stats.indexes = [];
    }

    return stats;
  } catch (error) {
    logger.error('Failed to get database statistics', error);
    throw error;
  }
};

/**
 * Optimize database tables
 */
const optimizeTables = async () => {
  try {
    logger.info('Starting database table optimization');

    const tables = ['orders', 'appointments', 'products', 'order_items', 'contacts', 'users', 'audit_logs'];
    
    for (const table of tables) {
      try {
        await db.query(`OPTIMIZE TABLE ${table}`);
        logger.debug(`Optimized table: ${table}`);
      } catch (error) {
        logger.warn(`Failed to optimize table ${table}`, { error: error.message });
      }
    }

    logger.info('Database table optimization completed');
  } catch (error) {
    logger.error('Failed to optimize database tables', error);
    throw error;
  }
};

/**
 * Clean up old records based on retention policies
 */
const cleanupOldRecords = async () => {
  try {
    logger.info('Starting database cleanup');

    // Clean up old audit logs (keep 90 days)
    const auditCleanupResult = await db.query(`
      DELETE FROM audit_logs 
      WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);
    
    if (auditCleanupResult[0].affectedRows > 0) {
      logger.info(`Cleaned up ${auditCleanupResult[0].affectedRows} old audit log records`);
    }

    // Clean up old contact messages (keep 1 year)
    const contactCleanupResult = await db.query(`
      DELETE FROM contacts 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)
    `);
    
    if (contactCleanupResult[0].affectedRows > 0) {
      logger.info(`Cleaned up ${contactCleanupResult[0].affectedRows} old contact records`);
    }

    logger.info('Database cleanup completed');
  } catch (error) {
    logger.error('Failed to cleanup old database records', error);
    throw error;
  }
};

/**
 * Initialize database optimizations
 */
const initializeDatabase = async () => {
  try {
    logger.info('Initializing database optimizations');
    
    // Create indexes
    await createIndexes();
    
    // Get initial stats
    const stats = await getDatabaseStats();
    logger.info('Database statistics', stats);
    
    // Schedule periodic maintenance
    if (process.env.NODE_ENV === 'production') {
      // Run optimization weekly
      setInterval(async () => {
        try {
          await optimizeTables();
          await cleanupOldRecords();
        } catch (error) {
          logger.error('Scheduled database maintenance failed', error);
        }
      }, 7 * 24 * 60 * 60 * 1000); // 7 days
    }
    
    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Database initialization failed', error);
    throw error;
  }
};

module.exports = {
  withTransaction,
  createIndexes,
  analyzeQuery,
  getDatabaseStats,
  optimizeTables,
  cleanupOldRecords,
  initializeDatabase
};