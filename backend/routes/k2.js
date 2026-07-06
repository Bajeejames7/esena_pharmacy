const express = require('express');
const router = express.Router();
const k2Controller = require('../controllers/k2Controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes (customer-facing)
router.post('/stkpush', k2Controller.initiateSTKPush);
router.post('/webhook', k2Controller.handleWebhook);
router.get('/status/:paymentRequestId', k2Controller.checkPaymentStatus);

// Admin routes
router.get('/order/:orderId/payments', authenticate, authorize(['admin', 'doctor']), k2Controller.getOrderPayments);

module.exports = router;
