const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  initiateSTKPush,
  handleCallback,
  checkPaymentStatus,
  getOrderPayments
} = require('../controllers/mpesaController');

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Trigger STK Push (customer-facing payment initiation)
// POST /api/mpesa/stkpush
// Body: { orderId, phoneNumber, amount }
router.post('/stkpush', initiateSTKPush);

// M-Pesa Callback Webhook (Safaricom POSTs here after payment)
// POST /api/mpesa/callback
// This URL must be HTTPS and publicly accessible
router.post('/callback', handleCallback);

// Poll payment status (used by frontend to check if payment went through)
// GET /api/mpesa/status/:checkoutRequestId
router.get('/status/:checkoutRequestId', checkPaymentStatus);

// ==========================================
// PROTECTED ROUTES (Admin only)
// ==========================================

// Get all payment attempts for a specific order
// GET /api/mpesa/order/:orderId/payments
router.get('/order/:orderId/payments', auth, getOrderPayments);

module.exports = router;
