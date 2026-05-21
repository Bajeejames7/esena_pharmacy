const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

/**
 * Build a WHERE clause for date filtering.
 * Supports: today, week, last_week, month, last_month, year, custom (date_from + date_to)
 */
function buildDateFilter(period, dateFrom, dateTo, column = 'o.created_at') {
  const conditions = [];
  const params = [];

  if (period === 'today') {
    conditions.push(`DATE(${column}) = CURDATE()`);
  } else if (period === 'week') {
    conditions.push(`${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
  } else if (period === 'last_week') {
    conditions.push(`${column} >= DATE_SUB(NOW(), INTERVAL 14 DAY)`);
    conditions.push(`${column} < DATE_SUB(NOW(), INTERVAL 7 DAY)`);
  } else if (period === 'month') {
    conditions.push(`${column} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
  } else if (period === 'last_month') {
    conditions.push(`${column} >= DATE_SUB(NOW(), INTERVAL 60 DAY)`);
    conditions.push(`${column} < DATE_SUB(NOW(), INTERVAL 30 DAY)`);
  } else if (period === 'year') {
    conditions.push(`${column} >= DATE_SUB(NOW(), INTERVAL 365 DAY)`);
  } else if (period === 'custom' && dateFrom && dateTo) {
    conditions.push(`DATE(${column}) >= ?`);
    conditions.push(`DATE(${column}) <= ?`);
    params.push(dateFrom, dateTo);
  }

  return { conditions, params };
}

/**
 * GET /api/reports/sales
 * Query params: period, date_from, date_to
 * Summary metrics always count completed orders only.
 * Status breakdown shows all statuses for context.
 */
router.get('/sales', auth, async (req, res) => {
  try {
    const { period = 'month', date_from, date_to } = req.query;

    // Summary always counts completed orders only
    const { conditions, params } = buildDateFilter(period, date_from, date_to);
    const completedCondition = `o.status = 'completed'`;
    const summaryConditions = [completedCondition, ...conditions];
    const summaryParams = [...params];
    const summaryWhere = 'WHERE ' + summaryConditions.join(' AND ');

    // ── Summary (completed orders only) ──────────────────────
    const [[summary]] = await db.query(
      `SELECT
         COUNT(DISTINCT o.id)                                        AS total_orders,
         COALESCE(SUM(o.total), 0)                                   AS total_revenue,
         COALESCE(SUM(o.total - COALESCE(o.shipping_cost, 0)), 0)    AS total_subtotal,
         COALESCE(SUM(o.shipping_cost), 0)                           AS total_shipping,
         COALESCE(SUM(oi.quantity), 0)                               AS total_units_sold,
         COALESCE(AVG(o.total), 0)                                   AS avg_order_value
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${summaryWhere}`,
      summaryParams
    );

    // ── Top selling products (completed orders only) ──────────
    const [topProducts] = await db.query(
      `SELECT
         COALESCE(p.name, oi.item_name, 'Unknown')     AS product_name,
         COALESCE(p.category, 'Uncategorised')         AS category,
         SUM(oi.quantity)                              AS units_sold,
         SUM(oi.quantity * oi.price)                   AS revenue,
         COUNT(DISTINCT o.id)                          AS order_count
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       ${summaryWhere}
       GROUP BY oi.product_id, oi.item_name
       ORDER BY units_sold DESC
       LIMIT 50`,
      summaryParams
    );

    // ── Revenue by day (completed orders only, for chart) ─────
    const [dailyRevenue] = await db.query(
      `SELECT
         DATE(o.created_at)                            AS date,
         COUNT(DISTINCT o.id)                          AS orders,
         COALESCE(SUM(o.total), 0)                     AS revenue
       FROM orders o
       ${summaryWhere}
       GROUP BY DATE(o.created_at)
       ORDER BY date ASC`,
      summaryParams
    );

    // ── Revenue by category (completed orders only) ───────────
    const [byCategory] = await db.query(
      `SELECT
         COALESCE(p.category, 'Uncategorised')         AS category,
         SUM(oi.quantity)                              AS units_sold,
         SUM(oi.quantity * oi.price)                   AS revenue
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       ${summaryWhere}
       GROUP BY COALESCE(p.category, 'Uncategorised')
       ORDER BY revenue DESC`,
      summaryParams
    );

    // ── All orders by status (same date range, no status filter) ──
    const dateOnly = buildDateFilter(period, date_from, date_to);
    const statusBreakdownWhere = dateOnly.conditions.length
      ? 'WHERE ' + dateOnly.conditions.join(' AND ')
      : '';

    const [statusBreakdown] = await db.query(
      `SELECT
         o.status,
         COUNT(*) AS count,
         COALESCE(SUM(o.total), 0) AS revenue
       FROM orders o
       ${statusBreakdownWhere}
       GROUP BY o.status
       ORDER BY count DESC`,
      dateOnly.params
    );

    res.json({
      period,
      date_from: date_from || null,
      date_to: date_to || null,
      summary,
      top_products: topProducts,
      daily_revenue: dailyRevenue,
      by_category: byCategory,
      status_breakdown: statusBreakdown,
    });
  } catch (err) {
    console.error('Sales report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
