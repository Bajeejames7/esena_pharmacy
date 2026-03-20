const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const auth = require('../middleware/auth');

/**
 * Recursively sum file sizes in a directory
 */
function getDirSize(dirPath) {
  let totalBytes = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        totalBytes += getDirSize(fullPath);
      } else if (entry.isFile()) {
        try {
          totalBytes += fs.statSync(fullPath).size;
        } catch (_) {}
      }
    }
  } catch (_) {}
  return totalBytes;
}

/**
 * Get real storage usage from uploads directory
 */
function getStorageStats() {
  const uploadsBase = path.join(__dirname, '..', 'uploads');
  const quotaGB = parseFloat(process.env.STORAGE_QUOTA_GB) || 45;
  const quotaBytes = quotaGB * 1024 * 1024 * 1024;

  const subfolders = ['products', 'prescriptions', 'blogs', 'videos'];
  const breakdown = {};
  let totalBytes = 0;

  for (const folder of subfolders) {
    const folderPath = path.join(uploadsBase, folder);
    const bytes = getDirSize(folderPath);
    breakdown[folder] = {
      bytes,
      mb: parseFloat((bytes / (1024 * 1024)).toFixed(2))
    };
    totalBytes += bytes;
  }

  const usedMB = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));
  const usedGB = parseFloat((totalBytes / (1024 * 1024 * 1024)).toFixed(4));
  const percentage = parseFloat(((totalBytes / quotaBytes) * 100).toFixed(2));

  return { usedBytes: totalBytes, usedMB, usedGB, quotaGB, percentage, breakdown };
}

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats
 */
router.get('/stats', auth, async (req, res) => {
  try {
    // Get pending orders count
    const [pendingOrdersResult] = await db.query(
      'SELECT COUNT(*) as count FROM orders WHERE status IN (?, ?)',
      ['pending', 'processing']
    );
    const pendingOrders = pendingOrdersResult[0].count;

    // Get pending appointments count
    const [pendingAppointmentsResult] = await db.query(
      'SELECT COUNT(*) as count FROM appointments WHERE status = ?',
      ['pending']
    );
    const pendingAppointments = pendingAppointmentsResult[0].count;

    // Get products in stock count
    const [productsInStockResult] = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE stock > 0'
    );
    const productsInStock = productsInStockResult[0].count;

    // Get total revenue (sum of completed orders)
    const [revenueResult] = await db.query(
      'SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status IN (?, ?)',
      ['delivered', 'completed']
    );
    const totalRevenue = parseFloat(revenueResult[0].total) || 0;

    // Calculate trends (compare with previous period)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Orders trend
    const [currentOrdersResult] = await db.query(
      'SELECT COUNT(*) as count FROM orders WHERE created_at >= ?',
      [thirtyDaysAgo.toISOString().split('T')[0]]
    );
    const [previousOrdersResult] = await db.query(
      'SELECT COUNT(*) as count FROM orders WHERE created_at >= ? AND created_at < ?',
      [sixtyDaysAgo.toISOString().split('T')[0], thirtyDaysAgo.toISOString().split('T')[0]]
    );

    const currentOrders = currentOrdersResult[0].count;
    const previousOrders = previousOrdersResult[0].count;
    const ordersTrend = previousOrders > 0 ? 
      Math.round(((currentOrders - previousOrders) / previousOrders) * 100) : 0;

    // Revenue trend
    const [currentRevenueResult] = await db.query(
      'SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status IN (?, ?) AND created_at >= ?',
      ['delivered', 'completed', thirtyDaysAgo.toISOString().split('T')[0]]
    );
    const [previousRevenueResult] = await db.query(
      'SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status IN (?, ?) AND created_at >= ? AND created_at < ?',
      ['delivered', 'completed', sixtyDaysAgo.toISOString().split('T')[0], thirtyDaysAgo.toISOString().split('T')[0]]
    );

    const currentRevenue = parseFloat(currentRevenueResult[0].total) || 0;
    const previousRevenue = parseFloat(previousRevenueResult[0].total) || 0;
    const revenueTrend = previousRevenue > 0 ? 
      Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : 0;

    // Get real file storage usage from uploads directory
    const storage = getStorageStats();
    const storageLabel = storage.usedGB >= 1
      ? `${storage.usedGB.toFixed(2)} GB / ${storage.quotaGB} GB (${storage.percentage}%)`
      : `${storage.usedMB} MB / ${storage.quotaGB} GB (${storage.percentage}%)`;

    const stats = {
      pendingOrders,
      pendingAppointments,
      productsInStock,
      totalRevenue,
      trends: {
        orders: {
          trend: ordersTrend >= 0 ? 'up' : 'down',
          value: `${ordersTrend >= 0 ? '+' : ''}${ordersTrend}%`
        },
        appointments: {
          trend: 'up',
          value: '0%'
        },
        products: {
          trend: 'up',
          value: '0%'
        },
        revenue: {
          trend: revenueTrend >= 0 ? 'up' : 'down',
          value: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`
        }
      },
      systemStatus: {
        database: 'connected',
        emailService: 'operational',
        fileStorage: storageLabel,
        api: 'healthy'
      },
      storage
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      details: error.message 
    });
  }
});

/**
 * Get recent activity log for dashboard
 * GET /api/admin/dashboard/activity
 */
router.get('/activity', auth, async (req, res) => {
  try {
    const [logs] = await db.query(
      `SELECT id, user_name, action, resource_type, resource_id, description, created_at
       FROM activity_log ORDER BY created_at DESC LIMIT 7`
    );
    res.json({ logs });
  } catch (error) {
    // Table may not exist yet (migration not run) — return empty gracefully
    res.json({ logs: [] });
  }
});

module.exports = router;
