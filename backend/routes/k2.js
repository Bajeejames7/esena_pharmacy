'use strict';

/**
 * routes/k2.js
 *
 * Public:
 *   POST /api/k2/stkpush             - trigger an STK Push for an order
 *   POST /api/k2/webhook             - K2's result callback for that request
 *   GET  /api/k2/status/:requestId   - frontend polls this while waiting
 *
 * Admin only:
 *   GET  /api/k2/order/:orderId/payments  - payment attempt history
 */

const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/k2Controller');

router.post('/stkpush', ctrl.initiateSTKPush);
router.post('/webhook', ctrl.handleCallback);
router.get('/status/:paymentRequestId', ctrl.checkPaymentStatus);

router.get('/order/:orderId/payments', auth, ctrl.getOrderPayments);

module.exports = router;
