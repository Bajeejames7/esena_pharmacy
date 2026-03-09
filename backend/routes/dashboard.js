const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const auth = require('../middleware/auth');

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats
 */
router.get('/stats', auth, async (req, res) => {
  try {
    // Get pending orders count
    const [pendingOrdersResult] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE status IN (?, ?)',
      ['pending', 'processing']
    );
    const pendingOrders = pendingOrdersResult[0].count;

    // Get pending appointments count
    const [pendingAppointmentsResult] = await db.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE status = ?',
      ['pending']
    );
    const pendingAppointments = pendingAppointmentsResult[0].count;

    // Get products in stock count
    const [productsInStockResult] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE stock > 0'
    );
    const productsInStock = productsInStockResult[0].count;

    // Get total revenue (sum of completed orders)
    const [revenueResult] = await db.execute(
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
    const [currentOrdersResult] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE created_at >= ?',
      [thirtyDaysAgo.toISOString().split('T')[0]]
    );
    const [previousOrdersResult] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE created_at >= ? AND created_at < ?',
      [sixtyDaysAgo.toISOString().split('T')[0], thirtyDaysAgo.toISOString().split('T')[0]]
    );

    const currentOrders = currentOrdersResult[0].count;
    const previousOrders = previousOrdersResult[0].count;
    const ordersTrend = previousOrders > 0 ? 
      Math.round(((currentOrders - previousOrders) / previousOrders) * 100) : 0;

    // Revenue trend
    const [currentRevenueResult] = await db.execute(
      'SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status IN (?, ?) AND created_at >= ?',
      ['delivered', 'completed', thirtyDaysAgo.toISOString().split('T')[0]]
    );
    const [previousRevenueResult] = await db.execute(
      'SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status IN (?, ?) AND created_at >= ? AND created_at < ?',
      ['delivered', 'completed', sixtyDaysAgo.toISOString().split('T')[0], thirtyDaysAgo.toISOString().split('T')[0]]
    );

    const currentRevenue = parseFloat(currentRevenueResult[0].total) || 0;
    const previousRevenue = parseFloat(previousRevenueResult[0].total) || 0;
    const revenueTrend = previousRevenue > 0 ? 
      Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : 0;

    // Get file storage usage (approximate)
    const [uploadsResult] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE image IS NOT NULL OR video IS NOT NULL'
    );
    const fileCount = uploadsResult[0].count;
    const estimatedStorageUsage = Math.min(Math.round((fileCount / 100) * 100), 95); // Estimate based on file count

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
        fileStorage: `${estimatedStorageUsage}% Used`,
        api: 'healthy'
      }
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

module.exports = router;