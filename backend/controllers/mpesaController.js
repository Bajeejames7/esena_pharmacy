const axios = require('axios');
const db = require('../config/db');
const { logger } = require('../utils/logger');
const { logActivity } = require('../utils/activityLog');
const { sendEmail, paymentConfirmedTemplate } = require('../config/mail');
const { generateReceiptHTML } = require('../utils/receiptGenerator');

// ==========================================
// CONFIGURATION
// ==========================================
const MPESA_CONFIG = {
  consumerKey:       process.env.MPESA_CONSUMER_KEY,
  consumerSecret:    process.env.MPESA_CONSUMER_SECRET,
  businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '3611027',
  passkey:           process.env.MPESA_PASSKEY,
  callbackUrl:       process.env.MPESA_CALLBACK_URL,
  environment:       process.env.MPESA_ENVIRONMENT || 'sandbox',
};

// OAuth token cache (1 hour)
let tokenCache = { token: null, expiresAt: null };

const getBaseUrl = () =>
  MPESA_CONFIG.environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

// ==========================================
// HELPER: Get OAuth token with caching
// ==========================================
const getMpesaToken = async () => {
  if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
  try {
    const res = await axios.get(
      `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` }, timeout: 15000 }
    );
    const token = res.data.access_token;
    const expiresIn = parseInt(res.data.expires_in) || 3599;
    tokenCache = { token, expiresAt: Date.now() + ((expiresIn - 60) * 1000) };
    logger.info('Generated new M-Pesa OAuth token', { expiresIn });
    return token;
  } catch (err) {
    // Clear stale cache on failure
    tokenCache = { token: null, expiresAt: null };
    logger.error('M-Pesa token generation failed', { error: err.response?.data || err.message });
    throw new Error('Failed to authenticate with M-Pesa API');
  }
};

// ==========================================
// HELPER: Format phone to 254XXXXXXXXX
// ==========================================
const formatPhoneNumber = (phone) => {
  let cleaned = String(phone).replace(/[\s\-+]/g, '');
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
  if (!cleaned.startsWith('254')) throw new Error('Invalid phone number. Must be a Kenyan number (07XX or 254XXX)');
  if (cleaned.length !== 12)      throw new Error('Invalid phone number length. Must be 12 digits (254XXXXXXXXX)');
  return cleaned;
};

// ==========================================
// HELPER: Timestamp YYYYMMDDHHmmss
// ==========================================
const generateTimestamp = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    ('0' + d.getDate()).slice(-2) +
    ('0' + d.getHours()).slice(-2) +
    ('0' + d.getMinutes()).slice(-2) +
    ('0' + d.getSeconds()).slice(-2)
  );
};

// ==========================================
// HELPER: Safe logActivity — never throws
// ==========================================
const safeLog = async (data) => {
  try { await logActivity(data); } catch (_) {}
};

// ==========================================
// ROUTE 1: Initiate STK Push
// POST /api/mpesa/stkpush
// ==========================================
exports.initiateSTKPush = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
  } catch (dbErr) {
    logger.error('STK Push: DB connection failed', { error: dbErr.message });
    return res.status(503).json({ success: false, message: 'Service temporarily unavailable. Please try again.' });
  }

  try {
    const { orderId, phoneNumber, amount } = req.body;

    if (!orderId || !phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields: orderId, phoneNumber, amount' });
    }

    // Validate order
    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = orders[0];
    if (!['pending', 'payment_requested'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Order cannot be paid in its current state (${order.status})` });
    }

    // Format phone
    let formattedPhone;
    try {
      formattedPhone = formatPhoneNumber(phoneNumber);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Amount validation
    const requestedAmount = Math.round(parseFloat(amount));
    const orderTotal      = Math.round(parseFloat(order.total));
    if (requestedAmount !== orderTotal) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Order total is KSH ${orderTotal}, received KSH ${requestedAmount}`
      });
    }

    // Build STK Push payload
    const timestamp = generateTimestamp();
    const password  = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
    const token     = await getMpesaToken();
    const transactionType = MPESA_CONFIG.environment === 'sandbox'
      ? 'CustomerPayBillOnline'
      : 'CustomerBuyGoodsOnline';

    const stkData = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   transactionType,
      Amount:            requestedAmount,
      PartyA:            formattedPhone,
      PartyB:            MPESA_CONFIG.businessShortCode,
      PhoneNumber:       formattedPhone,
      CallBackURL:       MPESA_CONFIG.callbackUrl,
      AccountReference:  `Order-${orderId}`,
      TransactionDesc:   `Payment for Order #${orderId}`
    };

    logger.info('Initiating STK Push', { orderId, phone: formattedPhone, amount: requestedAmount });

    let mpesaResponse;
    try {
      mpesaResponse = await axios.post(
        `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`,
        stkData,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 }
      );
    } catch (axiosErr) {
      const errData = axiosErr.response?.data;
      const errMsg  = errData?.errorMessage || axiosErr.message;
      logger.error('STK Push Axios error', { orderId, error: errMsg, data: errData });
      return res.status(502).json({
        success: false,
        message: `M-Pesa request failed: ${errMsg}. Please try again.`
      });
    }

    const { CheckoutRequestID, MerchantRequestID, ResponseCode, ResponseDescription } = mpesaResponse.data;

    if (ResponseCode !== '0') {
      logger.error('STK Push rejected by Safaricom', { orderId, ResponseCode, ResponseDescription });
      return res.status(400).json({ success: false, message: ResponseDescription || 'STK Push failed' });
    }

    // Persist payment record
    await connection.query(
      `INSERT INTO mpesa_payments
       (order_id, checkout_request_id, merchant_request_id, phone_number, amount, status, expires_at)
       VALUES (?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 2 MINUTE))`,
      [orderId, CheckoutRequestID, MerchantRequestID, formattedPhone, requestedAmount]
    );

    if (order.status === 'pending') {
      await connection.query(
        'UPDATE orders SET status = ?, payment_method = ? WHERE id = ?',
        ['payment_requested', 'mpesa', orderId]
      );
    }

    logger.info('STK Push initiated successfully', { orderId, checkoutRequestId: CheckoutRequestID });

    return res.status(200).json({
      success: true,
      message: 'STK Push sent. Please check your phone.',
      checkoutRequestId: CheckoutRequestID,
      merchantRequestId: MerchantRequestID
    });

  } catch (error) {
    logger.error('STK Push unhandled error', { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { detail: error.message })
    });
  } finally {
    if (connection) connection.release();
  }
};

// ==========================================
// ROUTE 2: Safaricom Callback Webhook
// POST /api/mpesa/callback
// ==========================================
exports.handleCallback = async (req, res) => {
  // Acknowledge Safaricom immediately — never leave them hanging
  // Process is done synchronously before the ack so DB is updated in time for polling
  let connection;

  try {
    connection = await db.getConnection();
  } catch (dbErr) {
    logger.error('Callback: DB connection failed', { error: dbErr.message });
    return res.status(200).json({ ResultCode: 0, ResultDescription: 'Accepted' });
  }

  try {
    // Parse callback body
    const callbackData = req.body?.Body?.stkCallback;
    if (!callbackData) {
      logger.error('Callback: invalid payload', { body: JSON.stringify(req.body).substring(0, 200) });
      return res.status(200).json({ ResultCode: 0, ResultDescription: 'Accepted' });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData;

    logger.info('M-Pesa callback received', { checkoutRequestId: CheckoutRequestID, resultCode: ResultCode, resultDesc: ResultDesc });

    // Find payment record
    const [payments] = await connection.query(
      'SELECT * FROM mpesa_payments WHERE checkout_request_id = ?',
      [CheckoutRequestID]
    );

    if (payments.length === 0) {
      logger.warn('Callback: payment record not found', { CheckoutRequestID });
      return res.status(200).json({ ResultCode: 0, ResultDescription: 'Accepted' });
    }

    const payment = payments[0];
    const orderId = payment.order_id;

    await connection.beginTransaction();

    try {
      if (ResultCode === 0) {
        // ── SUCCESSFUL PAYMENT ────────────────────────────────────────────
        const metadata = callbackData.CallbackMetadata?.Item || [];
        const amount             = metadata.find(i => i.Name === 'Amount')?.Value;
        const mpesaReceiptNumber = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate    = metadata.find(i => i.Name === 'TransactionDate')?.Value;

        // Guard: receipt must exist
        if (!mpesaReceiptNumber) {
          logger.error('Callback: missing receipt number', { CheckoutRequestID });
          await connection.rollback();
          return res.status(200).json({ ResultCode: 0, ResultDescription: 'Accepted' });
        }

        // Guard: amount must match
        const expected = Math.round(parseFloat(payment.amount));
        const received = Math.round(parseFloat(amount));
        if (received !== expected) {
          logger.error('Callback: amount mismatch', { orderId, expected, received, receipt: mpesaReceiptNumber });
          await connection.query(
            `UPDATE mpesa_payments SET result_code=?, result_desc=?, status='failed' WHERE id=?`,
            [ResultCode, `Amount mismatch: expected ${expected}, received ${received}`, payment.id]
          );
          await connection.commit();
          return res.status(200).json({ ResultCode: 0, ResultDescription: 'Accepted' });
        }

        // Guard: no duplicate receipt
        const [dup] = await connection.query(
          'SELECT id FROM mpesa_payments WHERE mpesa_receipt_number = ? AND id != ?',
          [mpesaReceiptNumber, payment.id]
        );
        if (dup.length > 0) {
          logger.warn('Callback: duplicate receipt', { receipt: mpesaReceiptNumber, orderId });
          await connection.rollback();
          return res.status(200).json({ ResultCode: 0, ResultDescription: 'Accepted' });
        }

        // Guard: payment must still be pending
        if (payment.status !== 'pending') {
          logger.warn('Callback: payment already processed', { paymentId: payment.id, status: payment.status });
          await connection.rollback();
          return res.status(200).json({ ResultCode: 0, ResultDescription: 'Accepted' });
        }

        // Guard: order must be in a payable state
        const [currentOrder] = await connection.query('SELECT status FROM orders WHERE id = ?', [orderId]);
        if (!currentOrder.length || !['pending', 'payment_requested'].includes(currentOrder[0].status)) {
          logger.warn('Callback: order not payable', { orderId, status: currentOrder[0]?.status });
          await connection.rollback();
          return res.status(200).json({ ResultCode: 0, ResultDescription: 'Accepted' });
        }

        // ── ALL CHECKS PASSED ─────────────────────────────────────────────
        logger.info('All payment verifications passed', { orderId, receipt: mpesaReceiptNumber, amount: received });

        await connection.query(
          `UPDATE mpesa_payments
           SET mpesa_receipt_number=?, transaction_date=?, result_code=?, result_desc=?, status='success'
           WHERE id=?`,
          [
            mpesaReceiptNumber,
            transactionDate ? new Date(String(transactionDate)) : new Date(),
            ResultCode,
            ResultDesc,
            payment.id
          ]
        );

        await connection.query(
          'UPDATE orders SET status=?, mpesa_receipt=?, payment_method=? WHERE id=?',
          ['paid', mpesaReceiptNumber, 'mpesa', orderId]
        );

        await connection.commit();

        logger.info('Payment marked as successful in DB', { orderId, receipt: mpesaReceiptNumber });

        // Fire-and-forget: email + activity log (never crash the callback)
        setImmediate(async () => {
          await safeLog({
            userId: null, userName: 'M-Pesa System',
            action: 'PAYMENT_COMPLETED', resourceType: 'order', resourceId: orderId,
            description: `M-Pesa payment completed. Receipt: ${mpesaReceiptNumber}, Amount: KSH ${amount}`,
            ip: req.ip
          });
          try {
            const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
            if (rows.length > 0) {
              const orderRow = rows[0];
              // Fetch order items for receipt
              const [items] = await db.query(
                `SELECT oi.*, COALESCE(oi.item_name, p.name) as name
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [orderId]
              );
              // Generate receipt HTML with logo
              const receiptHTML = generateReceiptHTML(orderRow, items);
              // Send payment confirmed email with receipt attached
              const tmpl = paymentConfirmedTemplate(orderRow, receiptHTML);
              await sendEmail({
                to: orderRow.email,
                subject: tmpl.subject,
                html: tmpl.html,
                attachments: tmpl.attachments
              });
            }
          } catch (emailErr) {
            logger.error('Payment confirmation email failed', { orderId, error: emailErr.message });
          }
        });

      } else {
        // ── FAILED / CANCELLED PAYMENT ────────────────────────────────────
        const newStatus = ResultCode === 1032 ? 'cancelled' : 'failed';
        await connection.query(
          `UPDATE mpesa_payments SET result_code=?, result_desc=?, status=? WHERE id=?`,
          [ResultCode, ResultDesc, newStatus, payment.id]
        );
        await connection.commit();

        logger.info('Payment failed/cancelled', { orderId, resultCode: ResultCode, resultDesc: ResultDesc });

        setImmediate(() => safeLog({
          userId: null, userName: 'M-Pesa System',
          action: 'PAYMENT_FAILED', resourceType: 'order', resourceId: orderId,
          description: `M-Pesa payment ${newStatus}. Reason: ${ResultDesc}`,
          ip: req.ip
        }));
      }

    } catch (innerErr) {
      await connection.rollback();
      logger.error('Callback: inner processing error', { error: innerErr.message, stack: innerErr.stack });
    }

    return res.status(200).json({ ResultCode: 0, ResultDescription: 'Success' });

  } catch (outerErr) {
    logger.error('Callback: outer unhandled error', { error: outerErr.message, stack: outerErr.stack });
    return res.status(200).json({ ResultCode: 0, ResultDescription: 'Accepted' });
  } finally {
    if (connection) connection.release();
  }
};

// ==========================================
// ROUTE 3: Poll Payment Status
// GET /api/mpesa/status/:checkoutRequestId
// ==========================================
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const [payments] = await db.query(
      `SELECT mp.*, o.token AS order_token
       FROM mpesa_payments mp
       JOIN orders o ON mp.order_id = o.id
       WHERE mp.checkout_request_id = ?`,
      [checkoutRequestId]
    );

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const p = payments[0];
    return res.json({
      success: true,
      payment: {
        orderId:         p.order_id,
        orderToken:      p.order_token,
        status:          p.status,
        amount:          parseFloat(p.amount),
        phoneNumber:     p.phone_number,
        mpesaReceipt:    p.mpesa_receipt_number,
        transactionDate: p.transaction_date,
        resultDescription: p.result_desc
      }
    });
  } catch (error) {
    logger.error('Payment status check error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to check payment status' });
  }
};

// ==========================================
// ROUTE 4: Order Payment History (Admin)
// GET /api/mpesa/order/:orderId/payments
// ==========================================
exports.getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;
    const [payments] = await db.query(
      'SELECT * FROM mpesa_payments WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    return res.json({
      success: true,
      payments: payments.map(p => ({
        id:               p.id,
        checkoutRequestId: p.checkout_request_id,
        phoneNumber:      p.phone_number,
        amount:           parseFloat(p.amount),
        status:           p.status,
        mpesaReceipt:     p.mpesa_receipt_number,
        transactionDate:  p.transaction_date,
        resultDescription: p.result_desc,
        createdAt:        p.created_at
      }))
    });
  } catch (error) {
    logger.error('Get order payments error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to retrieve payment history' });
  }
};
