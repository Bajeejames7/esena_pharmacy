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
    // Use separate queries to avoid JOIN inflation on SUM(total)
    const [[summary]] = await db.query(
      `SELECT
         COUNT(*)                                                     AS total_orders,
         COALESCE(SUM(total), 0)                                      AS total_revenue,
         COALESCE(SUM(total - COALESCE(shipping_cost, 0)), 0)         AS total_subtotal,
         COALESCE(SUM(shipping_cost), 0)                              AS total_shipping,
         COALESCE(AVG(total), 0)                                      AS avg_order_value
       FROM orders o
       ${summaryWhere}`,
      summaryParams
    );

    // Units sold in a separate query to avoid row multiplication from JOIN
    const [[unitsSold]] = await db.query(
      `SELECT COALESCE(SUM(oi.quantity), 0) AS total_units_sold
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       ${summaryWhere}`,
      summaryParams
    );
    summary.total_units_sold = unitsSold.total_units_sold;

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
         DATE_FORMAT(o.created_at, '%Y-%m-%d')         AS date,
         COUNT(DISTINCT o.id)                          AS orders,
         COALESCE(SUM(o.total), 0)                     AS revenue
       FROM orders o
       ${summaryWhere}
       GROUP BY DATE_FORMAT(o.created_at, '%Y-%m-%d')
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

/**
 * GET /api/reports/profit
 * Profit is calculated ONLY on completed orders where cost_price_at_sale
 * was captured at order-time (i.e. products linked to the POS).
 *
 * Revenue  = SUM(oi.price * oi.quantity)          — what customer paid
 * Cost     = SUM(oi.cost_price_at_sale * oi.quantity) — what it cost us
 * Profit   = Revenue - Cost
 * Margin % = (Profit / Revenue) * 100
 *
 * Items without cost_price_at_sale are excluded from profit maths but are
 * still visible in the "untracked_revenue" figure so nothing is hidden.
 *
 * Query params: period, date_from, date_to
 */
router.get('/profit', auth, async (req, res) => {
  try {
    const { period = 'month', date_from, date_to } = req.query;

    const { conditions, params } = buildDateFilter(period, date_from, date_to);
    const baseConditions = ["o.status = 'completed'", ...conditions];
    const baseWhere      = 'WHERE ' + baseConditions.join(' AND ');

    // ── Overall profit summary ─────────────────────────────────────────
    const [[summary]] = await db.query(
      `SELECT
         COUNT(DISTINCT o.id)                                             AS total_orders,

         /* Revenue on ALL completed order items */
         COALESCE(SUM(oi.price * oi.quantity), 0)                        AS total_revenue,

         /* Revenue only where we have a cost price (POS-linked items) */
         COALESCE(SUM(
           CASE WHEN oi.cost_price_at_sale IS NOT NULL
                THEN oi.price * oi.quantity ELSE 0 END
         ), 0)                                                            AS tracked_revenue,

         /* Cost of goods sold (POS-linked items only) */
         COALESCE(SUM(
           CASE WHEN oi.cost_price_at_sale IS NOT NULL
                THEN oi.cost_price_at_sale * oi.quantity ELSE 0 END
         ), 0)                                                            AS total_cost,

         /* Gross profit */
         COALESCE(SUM(
           CASE WHEN oi.cost_price_at_sale IS NOT NULL
                THEN (oi.price - oi.cost_price_at_sale) * oi.quantity
                ELSE 0 END
         ), 0)                                                            AS gross_profit,

         /* Revenue from items we have NO cost data for */
         COALESCE(SUM(
           CASE WHEN oi.cost_price_at_sale IS NULL
                THEN oi.price * oi.quantity ELSE 0 END
         ), 0)                                                            AS untracked_revenue,

         COUNT(DISTINCT CASE WHEN oi.cost_price_at_sale IS NOT NULL
                             THEN oi.product_id END)                     AS tracked_product_count,
         COUNT(DISTINCT CASE WHEN oi.cost_price_at_sale IS NULL
                             THEN oi.product_id END)                     AS untracked_product_count
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       ${baseWhere}`,
      params
    );

    // Compute margin % safely
    summary.gross_profit_margin =
      summary.tracked_revenue > 0
        ? parseFloat(((summary.gross_profit / summary.tracked_revenue) * 100).toFixed(2))
        : null;

    // ── Profit by product (top 50) ────────────────────────────────────
    const [byProduct] = await db.query(
      `SELECT
         COALESCE(oi.item_name, p.name, 'Unknown')     AS product_name,
         COALESCE(p.category, 'Uncategorised')         AS category,
         pm.pos_id                                     AS pos_medicine_id,
         pm.name                                       AS pos_medicine_name,
         SUM(oi.quantity)                              AS units_sold,
         SUM(oi.price * oi.quantity)                   AS revenue,
         SUM(oi.cost_price_at_sale * oi.quantity)      AS cost,
         SUM((oi.price - oi.cost_price_at_sale) * oi.quantity)  AS profit,
         ROUND(
           SUM((oi.price - oi.cost_price_at_sale) * oi.quantity)
           / NULLIF(SUM(oi.price * oi.quantity), 0) * 100, 2
         )                                             AS margin_pct
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN pos_medicines pm ON pm.pos_id = oi.pos_medicine_id
       ${baseWhere}
         AND oi.cost_price_at_sale IS NOT NULL
       GROUP BY oi.product_id, oi.item_name, p.name, p.category, pm.pos_id, pm.name
       ORDER BY profit DESC
       LIMIT 50`,
      params
    );

    // ── Profit by day (for chart) ─────────────────────────────────────
    const [byDay] = await db.query(
      `SELECT
         DATE_FORMAT(o.created_at, '%Y-%m-%d')         AS date,
         COALESCE(SUM(oi.price * oi.quantity), 0)      AS revenue,
         COALESCE(SUM(oi.cost_price_at_sale * oi.quantity), 0)  AS cost,
         COALESCE(SUM(
           (oi.price - oi.cost_price_at_sale) * oi.quantity
         ), 0)                                         AS profit
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       ${baseWhere}
         AND oi.cost_price_at_sale IS NOT NULL
       GROUP BY DATE_FORMAT(o.created_at, '%Y-%m-%d')
       ORDER BY date ASC`,
      params
    );

    // ── Products sold but NOT yet linked to POS (no profit data) ──────
    const [untracked] = await db.query(
      `SELECT
         COALESCE(oi.item_name, p.name, 'Unknown')     AS product_name,
         COALESCE(p.category, 'Uncategorised')         AS category,
         SUM(oi.quantity)                              AS units_sold,
         SUM(oi.price * oi.quantity)                   AS revenue
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       ${baseWhere}
         AND oi.cost_price_at_sale IS NULL
       GROUP BY oi.product_id, oi.item_name, p.name, p.category
       ORDER BY revenue DESC
       LIMIT 50`,
      params
    );

    // ── Recent POS deduction status (last 20) ─────────────────────────
    const [recentDeductions] = await db.query(
      `SELECT
         psd.order_id,
         psd.pos_medicine_id,
         pm.name          AS medicine_name,
         psd.quantity,
         psd.status,
         psd.response,
         psd.created_at
       FROM pos_stock_deductions psd
       LEFT JOIN pos_medicines pm ON pm.pos_id = psd.pos_medicine_id
       ORDER BY psd.created_at DESC
       LIMIT 20`
    );

    res.json({
      period,
      date_from:  date_from || null,
      date_to:    date_to   || null,
      summary,
      by_product:         byProduct,
      by_day:             byDay,
      untracked_products: untracked,
      recent_pos_deductions: recentDeductions,
    });

  } catch (err) {
    console.error('Profit report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
