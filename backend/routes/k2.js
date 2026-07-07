const express = require('express');
const router = express.Router();
const k2Controller = require('../controllers/k2Controller');
const auth = require('../middleware/auth');

// Public routes (customer-facing)
router.post('/stkpush', k2Controller.initiateSTKPush);
router.post('/webhook', k2Controller.handleWebhook);
router.get('/status/:paymentRequestId', k2Controller.checkPaymentStatus);

// Admin routes (protected)
router.get('/order/:orderId/payments', auth, k2Controller.getOrderPayments);

module.exports = router;
