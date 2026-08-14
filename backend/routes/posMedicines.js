'use strict';

/**
 * routes/posMedicines.js
 *
 * Public:
 *   GET  /api/pos-medicines            - list POS medicines (searchable, paginated)
 *   GET  /api/pos-medicines/:posId     - single medicine by POS id
 *
 * Admin only:
 *   POST /api/pos-medicines/sync              - trigger a manual full sync
 *   GET  /api/pos-medicines/sync/logs         - view sync audit log
 *   POST /api/pos-medicines/:posId/link       - link POS medicine → local product
 */

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/posMedicineController');

// Public — storefront product listing can read this to show POS-sourced items
router.get('/',        ctrl.listMedicines);
router.get('/sync/logs', auth, ctrl.getSyncLogs);   // before /:posId so it doesn't get swallowed
router.get('/:posId',  ctrl.getMedicineByPosId);

// Admin
router.post('/sync',           auth, ctrl.triggerSync);
router.post('/:posId/link',    auth, ctrl.linkToProduct);

module.exports = router;
