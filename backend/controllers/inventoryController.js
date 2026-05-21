const db = require('../config/db');
const { logActivity } = require('../utils/activityLog');

/**
 * Get stock movements for a product with optional period filter
 * GET /api/inventory/:productId/movements?period=week|month|all&page=1
 */
exports.getMovements = async (req, res) => {
  try {
    const { productId } = req.params;
    const { period = 'all', page = 1, limit = 50 } = req.query;

    const [products] = await db.query('SELECT id, name, stock FROM products WHERE id = ?', [productId]);
    if (products.length === 0) return res.status(404).json({ message: 'Product not found' });

    const conditions = ['sm.product_id = ?'];
    const params = [productId];

    if (period === 'week') {
      conditions.push('sm.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
    } else if (period === 'month') {
      conditions.push('sm.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    } else if (period === 'last_month') {
      conditions.push('sm.created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND sm.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)');
    }

    const where = 'WHERE ' + conditions.join(' AND ');
    const pageLimit = Math.min(parseInt(limit) || 50, 200);
    const offset = (Math.max(parseInt(page) || 1, 1) - 1) * pageLimit;

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM stock_movements sm ${where}`, params
    );

    const [movements] = await db.query(
      `SELECT sm.*, u.username as user_name
       FROM stock_movements sm
       LEFT JOIN users u ON sm.performed_by = u.id
       ${where}
       ORDER BY sm.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset]
    );

    // Summary stats for the period
    const [[stats]] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END), 0) as total_in,
         COALESCE(SUM(CASE WHEN quantity < 0 THEN ABS(quantity) ELSE 0 END), 0) as total_out,
         COUNT(*) as movement_count
       FROM stock_movements sm ${where}`,
      params
    );

    res.json({
      product: products[0],
      movements,
      stats,
      total,
      page: parseInt(page),
      limit: pageLimit,
    });
  } catch (err) {
    console.error('getMovements error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Add a stock movement (restock, adjustment, damage, return)
 * POST /api/inventory/:productId/movements
 * Body: { type, quantity, note }
 */
exports.addMovement = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { productId } = req.params;
    const { type, quantity, note } = req.body;

    const validTypes = ['restock', 'adjustment', 'damage', 'return'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${validTypes.join(', ')}` });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty === 0) {
      return res.status(400).json({ message: 'quantity must be a non-zero integer' });
    }

    // For damage, quantity should be stored as negative (stock out)
    const actualQty = type === 'damage' ? -Math.abs(qty) : qty;

    const [products] = await connection.query('SELECT id, name, stock FROM products WHERE id = ?', [productId]);
    if (products.length === 0) return res.status(404).json({ message: 'Product not found' });

    const currentStock = products[0].stock;
    const newStock = currentStock + actualQty;

    if (newStock < 0) {
      return res.status(400).json({
        message: `Cannot reduce stock below 0. Current stock: ${currentStock}, requested change: ${actualQty}`
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO stock_movements (product_id, type, quantity, note, performed_by, performed_by_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, type, actualQty, note || null, req.user?.userId || null, req.user?.username || null]
    );

    await connection.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);

    await connection.commit();

    await logActivity({
      userId: req.user?.userId,
      userName: req.user?.username,
      action: 'STOCK_ADJUSTED',
      resourceType: 'product',
      resourceId: parseInt(productId),
      description: `Stock ${type}: ${actualQty > 0 ? '+' : ''}${actualQty} units. ${note || ''}. New stock: ${newStock}`,
      oldValue: { stock: currentStock },
      newValue: { stock: newStock },
      ip: req.ip,
    });

    res.status(201).json({
      message: 'Stock movement recorded',
      previousStock: currentStock,
      newStock,
      movement: { type, quantity: actualQty, note },
    });
  } catch (err) {
    await connection.rollback();
    console.error('addMovement error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    connection.release();
  }
};

/**
 * Get inventory summary across all products with period filter
 * GET /api/inventory/summary?period=week|month|all
 */
exports.getSummary = async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let dateCondition = '';
    if (period === 'week') {
      dateCondition = 'AND sm.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateCondition = 'AND sm.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    const [rows] = await db.query(
      `SELECT
         p.id,
         p.name,
         p.category,
         p.stock as current_stock,
         COALESCE(SUM(CASE WHEN sm.quantity > 0 ${dateCondition} THEN sm.quantity ELSE 0 END), 0) as total_in,
         COALESCE(SUM(CASE WHEN sm.quantity < 0 ${dateCondition} THEN ABS(sm.quantity) ELSE 0 END), 0) as total_out,
         COUNT(CASE WHEN sm.id IS NOT NULL ${dateCondition} THEN 1 END) as movement_count
       FROM products p
       LEFT JOIN stock_movements sm ON sm.product_id = p.id
       GROUP BY p.id, p.name, p.category, p.stock
       ORDER BY p.name ASC`
    );

    res.json({ products: rows, period });
  } catch (err) {
    console.error('getSummary error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
