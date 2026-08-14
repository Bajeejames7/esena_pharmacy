'use strict';

/**
 * controllers/posMedicineController.js
 *
 * Handles all HTTP requests related to the POS medicine integration:
 *
 *  GET  /api/pos-medicines              - list all synced medicines (with search/pagination)
 *  GET  /api/pos-medicines/:posId       - single medicine by POS id
 *  POST /api/pos-medicines/sync         - trigger a manual sync (admin only)
 *  GET  /api/pos-medicines/sync/logs    - view recent sync history (admin only)
 *  POST /api/pos-medicines/:posId/link  - link a POS medicine to a local product (admin only)
 */

const db      = require('../config/db');
const posSync = require('../services/posSync');
const { logActivity } = require('../utils/activityLog');

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * GET /api/pos-medicines
 * Returns medicines from the local pos_medicines cache table.
 * Supports ?search=, ?limit=, ?offset=, ?in_stock=1
 */
exports.listMedicines = async (req, res) => {
  try {
    const { search, in_stock, limit, offset } = req.query;
    const pageLimit  = Math.min(parseInt(limit)  || 50, 500);
    const pageOffset = Math.max(parseInt(offset) || 0, 0);

    const conditions = [];
    const params     = [];

    if (search) {
      conditions.push('name LIKE ?');
      params.push(`%${search}%`);
    }

    if (in_stock === '1' || in_stock === 'true') {
      conditions.push('pos_quantity > 0');
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM pos_medicines ${where}`, params
    );

    const [medicines] = await db.query(
      `SELECT
         pm.*,
         p.id        AS local_product_id,
         p.name      AS local_product_name,
         p.category  AS local_product_category,
         p.stock     AS local_stock,
         p.price     AS local_price,
         p.cost_price AS local_cost_price
       FROM pos_medicines pm
       LEFT JOIN products p ON p.pos_medicine_id = pm.pos_id
       ${where}
       ORDER BY pm.name ASC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, pageOffset]
    );

    res.json({ medicines, total, limit: pageLimit, offset: pageOffset });
  } catch (err) {
    console.error('listMedicines error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/pos-medicines/:posId
 * Returns a single POS medicine with its linked local product (if any).
 */
exports.getMedicineByPosId = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         pm.*,
         p.id        AS local_product_id,
         p.name      AS local_product_name,
         p.category  AS local_product_category,
         p.stock     AS local_stock,
         p.price     AS local_price,
         p.cost_price AS local_cost_price
       FROM pos_medicines pm
       LEFT JOIN products p ON p.pos_medicine_id = pm.pos_id
       WHERE pm.pos_id = ?`,
      [req.params.posId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'POS medicine not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('getMedicineByPosId error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Admin ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/pos-medicines/sync
 * Triggers a full sync from the POS API into pos_medicines.
 * Admin only.
 */
exports.triggerSync = async (req, res) => {
  try {
    const result = await posSync.syncMedicinesToLocalDB();
    posSync.invalidateCache();

    await logActivity({
      userId:       req.user?.userId,
      userName:     req.user?.username,
      action:       'POS_SYNC_TRIGGERED',
      resourceType: 'pos_medicines',
      resourceId:   null,
      description:  `Manual POS sync: fetched ${result.fetched}, upserted ${result.upserted} in ${result.durationMs}ms`,
      ip:           req.ip,
    });

    res.json({
      message:  'POS sync completed successfully',
      fetched:  result.fetched,
      upserted: result.upserted,
      duration: `${result.durationMs}ms`,
    });
  } catch (err) {
    console.error('triggerSync error:', err);
    res.status(500).json({ message: 'POS sync failed', error: err.message });
  }
};

/**
 * GET /api/pos-medicines/sync/logs
 * Returns recent sync log entries. Admin only.
 */
exports.getSyncLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const [logs] = await db.query(
      `SELECT * FROM pos_sync_log ORDER BY synced_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ logs });
  } catch (err) {
    console.error('getSyncLogs error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /api/pos-medicines/:posId/link
 * Links a POS medicine to a local product so stock deductions and profit
 * tracking work automatically for website orders.
 *
 * Body: { product_id: number, cost_price?: number }
 *
 * Setting product_id to null unlinks the association.
 */
exports.linkToProduct = async (req, res) => {
  try {
    const posId     = parseInt(req.params.posId, 10);
    const productId = req.body.product_id ? parseInt(req.body.product_id, 10) : null;
    const costPrice = req.body.cost_price  ? parseFloat(req.body.cost_price)  : null;

    // Verify POS medicine exists
    const [[pm]] = await db.query(
      'SELECT pos_id, name FROM pos_medicines WHERE pos_id = ?', [posId]
    );
    if (!pm) return res.status(404).json({ message: 'POS medicine not found' });

    if (productId !== null) {
      // Verify local product exists
      const [[prod]] = await db.query(
        'SELECT id, name FROM products WHERE id = ?', [productId]
      );
      if (!prod) return res.status(404).json({ message: 'Local product not found' });

      // Clear any existing link to this POS medicine from another product
      await db.query(
        'UPDATE products SET pos_medicine_id = NULL WHERE pos_medicine_id = ? AND id != ?',
        [posId, productId]
      );

      // Set the link + optional cost price
      const updateFields = ['pos_medicine_id = ?'];
      const updateParams = [posId];

      if (costPrice !== null) {
        updateFields.push('cost_price = ?');
        updateParams.push(costPrice);
      }

      updateParams.push(productId);
      await db.query(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      await logActivity({
        userId:       req.user?.userId,
        userName:     req.user?.username,
        action:       'POS_MEDICINE_LINKED',
        resourceType: 'product',
        resourceId:   productId,
        description:  `POS medicine "${pm.name}" (pos_id: ${posId}) linked to product "${prod.name}" (id: ${productId})`,
        ip:           req.ip,
      });

      return res.json({
        message:        'POS medicine linked to product successfully',
        pos_id:         posId,
        pos_name:       pm.name,
        local_product_id: productId,
        local_product_name: prod.name,
      });
    }

    // Unlink
    await db.query(
      'UPDATE products SET pos_medicine_id = NULL WHERE pos_medicine_id = ?',
      [posId]
    );

    await logActivity({
      userId:       req.user?.userId,
      userName:     req.user?.username,
      action:       'POS_MEDICINE_UNLINKED',
      resourceType: 'pos_medicines',
      resourceId:   posId,
      description:  `POS medicine "${pm.name}" (pos_id: ${posId}) unlinked from all local products`,
      ip:           req.ip,
    });

    res.json({ message: 'POS medicine unlinked', pos_id: posId });
  } catch (err) {
    console.error('linkToProduct error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
