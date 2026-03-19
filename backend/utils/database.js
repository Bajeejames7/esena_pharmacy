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
 * Create a single index only if it doesn't already exist (MySQL 5.x compatible)
 */
const createIndexIfNotExists = async (indexName, tableName, columns) => {
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) as cnt FROM information_schema.statistics 
       WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
      [tableName, indexName]
    );
    if (rows[0].cnt === 0) {
      await db.query(`CREATE INDEX ${indexName} ON ${tableName}(${columns})`);
      logger.debug(`Created index ${indexName} on ${tableName}`);
    }
  } catch (error) {
    // Non-fatal: log and continue
    logger.warn(`Skipped index ${indexName} on ${tableName}: ${error.message}`);
  }
};

/**
 * Create database indexes for performance optimization
 * Implements Requirement 27.7
 */
const createIndexes = async () => {
  logger.info('Creating database indexes for performance optimization');

  const indexes = [
    ['idx_orders_token',            'orders',       'token'],
    ['idx_orders_email',            'orders',       'email'],
    ['idx_orders_status',           'orders',       'status'],
    ['idx_orders_created_at',       'orders',       'created_at'],
    ['idx_appointments_token',      'appointments', 'token'],
    ['idx_appointments_email',      'appointments', 'email'],
    ['idx_appointments_status',     'appointments', 'status'],
    ['idx_appointments_date',       'appointments', 'date'],
    ['idx_appointments_service',    'appointments', 'service'],
    ['idx_products_category',       'products',     'category'],
    ['idx_products_name',           'products',     'name'],
    ['idx_products_stock',          'products',     'stock'],
    ['idx_order_items_order_id',    'order_items',  'order_id'],
    ['idx_order_items_product_id',  'order_items',  'product_id'],
    ['idx_contacts_email',          'contacts',     'email'],
    ['idx_contacts_created_at',     'contacts',     'created_at'],
    ['idx_users_username',          'users',        'username'],
    ['idx_users_role',              'users',        'role'],
    ['idx_audit_logs_user_id',      'audit_logs',   'user_id'],
    ['idx_audit_logs_action',       'audit_logs',   'action'],
    ['idx_audit_logs_resource',     'audit_logs',   'resource_type, resource_id'],
    ['idx_audit_logs_timestamp',    'audit_logs',   'timestamp'],
  ];

  for (const [name, table, cols] of indexes) {
    await createIndexIfNotExists(name, table, cols);
  }

  logger.info('Database indexes check completed');
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
 * Ensure all required tables exist and apply any pending column migrations.
 * Safe to run on every startup — uses IF NOT EXISTS / checks before altering.
 */
const ensureTables = async () => {
  // --- prescriptions table ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT,
      file_path VARCHAR(255) NOT NULL,
      status ENUM('pending','reviewed','completed','cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_prescriptions_status (status),
      INDEX idx_prescriptions_email (email)
    )
  `);
  logger.info('Table check: prescriptions OK');

  // --- settings table ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value VARCHAR(255) NOT NULL,
      description VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES
      ('delivery_nairobi',        '150', 'Delivery cost within Nairobi (KSH)'),
      ('delivery_outside_nairobi','350', 'Delivery cost outside Nairobi (KSH)'),
      ('pickup_cost',             '0',   'Cost for in-store pickup (KSH)')
  `);
  logger.info('Table check: settings OK');

  // --- Migration: appointments.time column ---
  try {
    const [cols] = await db.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'time'`
    );
    if (cols.length === 0) {
      await db.query(`ALTER TABLE appointments ADD COLUMN time VARCHAR(10) AFTER date`);
      logger.info('Migration applied: appointments.time column added');
    }
  } catch (err) {
    logger.warn('Migration check appointments.time failed: ' + err.message);
  }

  // --- Migration: order_items.product_id nullable ---
  try {
    const [cols] = await db.query(
      `SELECT IS_NULLABLE FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'product_id'`
    );
    if (cols.length > 0 && cols[0].IS_NULLABLE === 'NO') {
      await db.query(`ALTER TABLE order_items MODIFY COLUMN product_id INT NULL`);
      logger.info('Migration applied: order_items.product_id made nullable');
    }
  } catch (err) {
    logger.warn('Migration check order_items.product_id failed: ' + err.message);
  }

  // --- Migration: order_items.item_name column ---
  try {
    const [cols] = await db.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'item_name'`
    );
    if (cols.length === 0) {
      await db.query(`ALTER TABLE order_items ADD COLUMN item_name VARCHAR(255) NULL AFTER product_id`);
      logger.info('Migration applied: order_items.item_name column added');
    }
  } catch (err) {
    logger.warn('Migration check order_items.item_name failed: ' + err.message);
  }

  // --- Migration: appointments status ENUM (add no_show) ---
  try {
    await db.query(
      `ALTER TABLE appointments MODIFY COLUMN status ENUM('pending','confirmed','completed','cancelled','no_show') DEFAULT 'pending'`
    );
  } catch (err) {
    // Non-fatal — already has the value or unsupported
    logger.warn('Migration check appointments.status enum: ' + err.message);
  }
};

/**
 * Initialize database optimizations
 */
const initializeDatabase = async () => {
  try {
    logger.info('Initializing database optimizations');

    // Ensure required tables exist
    await ensureTables();
    
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