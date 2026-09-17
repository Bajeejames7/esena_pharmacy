'use strict';

/**
 * controllers/k2Controller.js
 *
 * K2 Connect (Kopo Kopo) — Buy Goods STK Push integration.
 * API reference: https://api-docs.kopokopo.com/ (v2)
 *
 *  - initiateSTKPush()   -> POST /api/v2/incoming_payments, triggers the prompt
 *  - handleCallback()    -> receives the per-request result K2 posts to
 *                           the callback_url we supplied when creating the payment
 *  - checkPaymentStatus()-> lets the frontend poll while it waits
 *  - getOrderPayments()  -> admin: payment attempt history for an order
 *
 * A failed/missed callback is NOT a dead end: an admin can always flip the
 * order to 'paid' manually via PUT /api/orders/:id/status (e.g. cash payment,
 * or the customer confirms they paid but the webhook never arrived).
 */

const axios  = require('axios');
const crypto = require('crypto');
const db     = require('../config/db');
const { logger } = require('../utils/logger');
const { logActivity } = require('../utils/activityLog');
const { sendEmail, paymentConfirmedTemplate } = require('../config/mail');

const K2_CONFIG = {
  clientId:     process.env.K2_CLIENT_ID,
  clientSecret: process.env.K2_CLIENT_SECRET,
  apiKey:       process.env.K2_API_KEY,       // used both as the request header's implicit trust anchor and as the webhook signature key
  tillNumber:   process.env.K2_TILL_NUMBER || '',
  callbackUrl:  process.env.K2_CALLBACK_URL || '',
  environment:  process.env.K2_ENVIRONMENT || 'sandbox',
};

let tokenCache = { token: null, expiresAt: null };

const getBaseUrl = () =>
  K2_CONFIG.environment === 'production'
    ? 'https://api.kopokopo.com'
    : 'https://sandbox.kopokopo.com';

async function getK2Token() {
  if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  try {
    const res = await axios.post(
      `${getBaseUrl()}/oauth/token`,
      {
        grant_type:    'client_credentials',
        client_id:     K2_CONFIG.clientId,
        client_secret: K2_CONFIG.clientSecret,
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15_000 }
    );

    const token = res.data.access_token;
    const expiresIn = parseInt(res.data.expires_in, 10) || 3599;
    tokenCache = { token, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
    return token;
  } catch (err) {
    tokenCache = { token: null, expiresAt: null };
    logger.error('K2 token generation failed', { error: err.response?.data || err.message });
    throw new Error('Failed to authenticate with K2 Connect API');
  }
}

function formatPhoneNumber(phone) {
  let cleaned = String(phone).replace(/[\s\-+]/g, '');
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
  if (!cleaned.startsWith('254')) throw new Error('Invalid phone number. Must be a Kenyan number (07XX or 254XXX)');
  if (cleaned.length !== 12) throw new Error('Invalid phone number length. Must be 12 digits (254XXXXXXXXX)');
  return '+' + cleaned;
}

const safeLog = (data) => logActivity(data).catch(() => {});

// ── ROUTE: POST /api/k2/stkpush ──────────────────────────────────────────────
exports.initiateSTKPush = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
  } catch (dbErr) {
    logger.error('K2 STK Push: DB connection failed', { error: dbErr.message });
    return res.status(503).json({ success: false, message: 'Service temporarily unavailable. Please try again.' });
  }

  try {
    const { orderId, phoneNumber, amount } = req.body;

    if (!orderId || !phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields: orderId, phoneNumber, amount' });
    }

    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = orders[0];
    if (!['pending', 'payment_requested'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Order cannot be paid in its current state (${order.status})` });
    }

    let formattedPhone;
    try {
      formattedPhone = formatPhoneNumber(phoneNumber);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const requestedAmount = Math.round(parseFloat(amount));
    const orderTotal = Math.round(parseFloat(order.total));
    if (requestedAmount !== orderTotal) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Order total is KSH ${orderTotal}, received KSH ${requestedAmount}`,
      });
    }

    const token = await getK2Token();

    const stkData = {
      payment_channel: 'M-PESA STK Push',
      till_number: K2_CONFIG.tillNumber,
      subscriber: {
        phone_number: formattedPhone,
        first_name: order.customer_name.split(' ')[0],
        last_name: order.customer_name.split(' ').slice(1).join(' ') || 'Customer',
      },
      amount: {
        currency: 'KES',
        value: requestedAmount,
      },
      metadata: {
        order_id: orderId.toString(),
        reference: `Order-${orderId}`,
      },
      _links: {
        callback_url: K2_CONFIG.callbackUrl,
      },
    };

    logger.info('Initiating K2 STK Push', { orderId, phone: formattedPhone, amount: requestedAmount });

    let k2Response;
    try {
      k2Response = await axios.post(
        `${getBaseUrl()}/api/v2/incoming_payments`,
        stkData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 30_000,
        }
      );
    } catch (axiosErr) {
      const errData = axiosErr.response?.data;
      const errMsg = errData?.error_message || axiosErr.message;
      logger.error('K2 STK Push request failed', { orderId, error: errMsg, data: errData });
      return res.status(502).json({ success: false, message: `K2 Connect request failed: ${errMsg}. Please try again.` });
    }

    // K2 returns the created resource's URL in the Location header; the id is the last segment.
    const resourceLocation = k2Response.headers.location;
    const paymentRequestId = resourceLocation ? resourceLocation.split('/').pop() : null;

    if (!paymentRequestId) {
      logger.error('K2 STK Push: No payment request ID returned', { orderId });
      return res.status(502).json({ success: false, message: 'Failed to initiate payment' });
    }

    await connection.query(
      `INSERT INTO mpesa_payments
       (order_id, checkout_request_id, merchant_request_id, phone_number, amount, status, expires_at)
       VALUES (?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
      [orderId, paymentRequestId, paymentRequestId, formattedPhone, requestedAmount]
    );

    if (order.status === 'pending') {
      await connection.query('UPDATE orders SET status = ? WHERE id = ?', ['payment_requested', orderId]);
    }

    logger.info('K2 STK Push initiated successfully', { orderId, paymentRequestId });

    return res.status(200).json({
      success: true,
      message: 'STK Push sent. Please check your phone.',
      checkoutRequestId: paymentRequestId,
      merchantRequestId: paymentRequestId,
    });
  } catch (error) {
    logger.error('K2 STK Push unhandled error', { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { detail: error.message }),
    });
  } finally {
    if (connection) connection.release();
  }
};

// ── ROUTE: POST /api/k2/webhook ──────────────────────────────────────────────
// This is the callback_url we supplied on the incoming_payments request above.
// K2 posts the result of THAT SPECIFIC payment request here — shape:
//   { data: { id, type: "incoming_payment", attributes: { status, metadata, amount, transaction: { reference }, initiation_time } } }
exports.handleCallback = async (req, res) => {
  // Acknowledge immediately — K2 retries on non-2xx / timeout.
  res.status(200).json({ status: 'received' });

  // Verify the HMAC-SHA256 signature before trusting anything in the body.
  // Per K2 docs: signed with your API Key, header X-KopoKopo-Signature.
  const signature = req.headers['x-kopokopo-signature'];
  if (!K2_CONFIG.apiKey || !signature) {
    logger.error('K2 callback rejected: missing signature or API key not configured');
    return;
  }
  const expectedSignature = crypto
    .createHmac('sha256', K2_CONFIG.apiKey)
    .update(req.rawBody || JSON.stringify(req.body))
    .digest('hex');
  if (signature !== expectedSignature) {
    logger.error('K2 callback rejected: signature mismatch');
    return;
  }

  let connection;
  try {
    connection = await db.getConnection();
  } catch (dbErr) {
    logger.error('K2 callback: DB connection failed', { error: dbErr.message });
    return;
  }

  try {
    const attributes = req.body?.data?.attributes;
    if (!attributes) {
      logger.warn('K2 callback: unexpected payload shape', { body: req.body });
      return;
    }

    const orderId    = parseInt(attributes.metadata?.order_id, 10);
    const status     = attributes.status; // "Success" | "Failed"
    const amount     = Math.round(parseFloat(attributes.amount?.value || 0));
    const reference  = attributes.transaction?.reference || null;

    if (!orderId) {
      logger.warn('K2 callback: no order_id in metadata', { attributes });
      return;
    }

    const [payments] = await connection.query(
      'SELECT * FROM mpesa_payments WHERE order_id = ? AND status = ?',
      [orderId, 'pending']
    );
    if (payments.length === 0) {
      logger.warn('K2 callback: no pending payment record found', { orderId });
      return;
    }
    const paymentRecord = payments[0];

    if (status !== 'Success') {
      await connection.query(
        `UPDATE mpesa_payments SET result_code = 1, result_desc = ?, status = 'failed' WHERE id = ?`,
        [attributes.status_description || status || 'Failed', paymentRecord.id]
      );
      logger.info('K2 payment failed', { orderId, status });
      return;
    }

    await connection.beginTransaction();
    try {
      const expected = Math.round(parseFloat(paymentRecord.amount));
      if (amount !== expected) {
        logger.error('K2 callback: amount mismatch', { orderId, expected, received: amount });
        await connection.query(
          `UPDATE mpesa_payments SET result_code = 1, result_desc = ?, status = 'failed' WHERE id = ?`,
          [`Amount mismatch: expected ${expected}, received ${amount}`, paymentRecord.id]
        );
        await connection.commit();
        return;
      }

      if (reference) {
        const [dup] = await connection.query(
          'SELECT id FROM mpesa_payments WHERE mpesa_receipt_number = ? AND id != ?',
          [reference, paymentRecord.id]
        );
        if (dup.length > 0) {
          logger.warn('K2 callback: duplicate receipt reference', { reference, orderId });
          await connection.rollback();
          return;
        }
      }

      const [currentOrder] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (!currentOrder.length || !['pending', 'payment_requested'].includes(currentOrder[0].status)) {
        logger.warn('K2 callback: order no longer payable', { orderId, status: currentOrder[0]?.status });
        await connection.rollback();
        return;
      }
      const order = currentOrder[0];

      await connection.query(
        `UPDATE mpesa_payments SET mpesa_receipt_number = ?, transaction_date = NOW(), result_code = 0, result_desc = 'Success', status = 'success' WHERE id = ?`,
        [reference, paymentRecord.id]
      );

      await connection.query(
        'UPDATE orders SET status = ?, payment_method = ?, mpesa_receipt = ? WHERE id = ?',
        ['paid', 'mpesa', reference, orderId]
      );

      await connection.commit();
      logger.info('K2 payment confirmed', { orderId, reference });

      setImmediate(async () => {
        await safeLog({
          userId: null,
          userName: 'K2 Connect',
          action: 'PAYMENT_COMPLETED',
          resourceType: 'order',
          resourceId: orderId,
          description: `K2 Connect payment completed. Reference: ${reference}, Amount: KSH ${amount}`,
          ip: req.ip,
        });

        try {
          const template = paymentConfirmedTemplate({ ...order, status: 'paid', mpesa_receipt: reference });
          await sendEmail({ to: order.email, subject: template.subject, html: template.html });
        } catch (emailErr) {
          logger.error('K2 payment confirmation email failed', { orderId, error: emailErr.message });
        }
      });
    } catch (innerErr) {
      await connection.rollback();
      logger.error('K2 callback: inner processing error', { error: innerErr.message, stack: innerErr.stack });
    }
  } catch (outerErr) {
    logger.error('K2 callback: unhandled error', { error: outerErr.message, stack: outerErr.stack });
  } finally {
    if (connection) connection.release();
  }
};

// ── ROUTE: GET /api/k2/status/:paymentRequestId ─────────────────────────────
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { paymentRequestId } = req.params;
    const [payments] = await db.query(
      `SELECT mp.*, o.token AS order_token
       FROM mpesa_payments mp
       JOIN orders o ON mp.order_id = o.id
       WHERE mp.checkout_request_id = ?`,
      [paymentRequestId]
    );

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const p = payments[0];
    return res.json({
      success: true,
      payment: {
        orderId: p.order_id,
        orderToken: p.order_token,
        status: p.status,
        amount: parseFloat(p.amount),
        phoneNumber: p.phone_number,
        mpesaReceipt: p.mpesa_receipt_number,
        transactionDate: p.transaction_date,
        resultDescription: p.result_desc,
      },
    });
  } catch (error) {
    logger.error('K2 payment status check error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to check payment status' });
  }
};

// ── ROUTE: GET /api/k2/order/:orderId/payments (admin) ──────────────────────
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
        id: p.id,
        checkoutRequestId: p.checkout_request_id,
        phoneNumber: p.phone_number,
        amount: parseFloat(p.amount),
        status: p.status,
        mpesaReceipt: p.mpesa_receipt_number,
        transactionDate: p.transaction_date,
        resultDescription: p.result_desc,
        createdAt: p.created_at,
      })),
    });
  } catch (error) {
    logger.error('Get K2 order payments error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to retrieve payment history' });
  }
};
