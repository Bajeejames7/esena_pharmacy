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

    // Get total revenue (sum of completed orders) — current calendar month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthStartStr = thisMonthStart.toISOString().slice(0, 10);

    const [revenueResult] = await db.query(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM orders
       WHERE status = 'completed'
       AND created_at >= ?`,
      [thisMonthStartStr]
    );
    const totalRevenue = parseFloat(revenueResult[0].total) || 0;

    // Date range label e.g. "1 May – 21 May 2026"
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const mon = monthNames[now.getMonth()];
    const yr  = now.getFullYear();
    const revenueMonthLabel = `1 ${mon} – ${now.getDate()} ${mon} ${yr}`;

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
      revenueMonthLabel,
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
 * Get revenue comparison using calendar weeks and calendar months.
 * - This week = Mon–Sun of the current ISO week
 * - Last week = Mon–Sun of the previous ISO week
 * - This month = 1st to last day of the current calendar month
 * - Last month = 1st to last day of the previous calendar month
 * GET /api/admin/dashboard/revenue
 */
router.get('/revenue', auth, async (req, res) => {
  try {
    // ── Calendar week boundaries (Monday-based) ───────────────
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() + diffToMonday);
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1); // one ms before this week started

    // ── Calendar month boundaries ─────────────────────────────
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const fmt = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

    const query = (from, to) => db.query(
      `SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
       FROM orders WHERE status = 'completed'
       AND created_at >= ? AND created_at <= ?`,
      [fmt(from), fmt(to)]
    );

    const [
      [thisWeekRows], [lastWeekRows],
      [thisMonthRows], [lastMonthRows],
      [allTimeRows]
    ] = await Promise.all([
      query(thisWeekStart, thisWeekEnd),
      query(lastWeekStart, lastWeekEnd),
      query(thisMonthStart, thisMonthEnd),
      query(lastMonthStart, lastMonthEnd),
      db.query(`SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders FROM orders WHERE status = 'completed'`)
    ]);

    const thisWeek  = thisWeekRows[0];
    const lastWeek  = lastWeekRows[0];
    const thisMonth = thisMonthRows[0];
    const lastMonth = lastMonthRows[0];
    const allTime   = allTimeRows[0];

    const pct = (curr, prev) => {
      const c = parseFloat(curr), p = parseFloat(prev);
      if (p === 0) return c > 0 ? 100 : 0;
      return Math.round(((c - p) / p) * 100);
    };

    // Month names for display
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const thisMonthName = monthNames[now.getMonth()];
    const lastMonthName = monthNames[now.getMonth() === 0 ? 11 : now.getMonth() - 1];

    // Week label e.g. "21–27 May"
    const weekLabel = (start, end) => {
      const s = `${start.getDate()} ${monthNames[start.getMonth()]}`;
      const e = `${end.getDate()} ${monthNames[end.getMonth()]}`;
      return `${s} – ${e}`;
    };

    res.json({
      this_week:  { revenue: parseFloat(thisWeek.revenue),  orders: Number(thisWeek.orders),  label: weekLabel(thisWeekStart, thisWeekEnd) },
      last_week:  { revenue: parseFloat(lastWeek.revenue),  orders: Number(lastWeek.orders),  label: weekLabel(lastWeekStart, lastWeekEnd) },
      this_month: { revenue: parseFloat(thisMonth.revenue), orders: Number(thisMonth.orders), label: thisMonthName },
      last_month: { revenue: parseFloat(lastMonth.revenue), orders: Number(lastMonth.orders), label: lastMonthName },
      all_time:   { revenue: parseFloat(allTime.revenue),   orders: Number(allTime.orders) },
      week_change:  pct(thisWeek.revenue,  lastWeek.revenue),
      month_change: pct(thisMonth.revenue, lastMonth.revenue),
    });
  } catch (error) {
    console.error('Revenue comparison error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data', details: error.message });
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
