const axios = require('axios');
const crypto = require('crypto');
const db = require('../config/db');
const { logger } = require('../utils/logger');
const { logActivity } = require('../utils/activityLog');
const { sendEmail, paymentConfirmedTemplate } = require('../config/mail');
const { generateReceiptHTML } = require('../utils/receiptGenerator');

// ==========================================
// K2 CONNECT (KOPO KOPO) CONFIGURATION
// ==========================================
const K2_CONFIG = {
  clientId:     process.env.K2_CLIENT_ID,
  clientSecret: process.env.K2_CLIENT_SECRET,
  apiKey:       process.env.K2_API_KEY,
  tillNumber:   process.env.K2_TILL_NUMBER || '3611027', // Your Buy Goods till
  webhookSecret: process.env.K2_WEBHOOK_SECRET,
  callbackUrl:  process.env.K2_CALLBACK_URL,
  environment:  process.env.K2_ENVIRONMENT || 'sandbox',
};

// OAuth token cache
let tokenCache = { token: null, expiresAt: null };

const getBaseUrl = () =>
  K2_CONFIG.environment === 'production'
    ? 'https://api.kopokopo.com'
    : 'https://sandbox.kopokopo.com';

// ==========================================
// HELPER: Get OAuth Token
// ==========================================
const getK2Token = async () => {
  if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  try {
    const res = await axios.post(
      `${getBaseUrl()}/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: K2_CONFIG.clientId,
        client_secret: K2_CONFIG.clientSecret
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    const token = res.data.access_token;
    const expiresIn = parseInt(res.data.expires_in) || 3599;
    tokenCache = { token, expiresAt: Date.now() + ((expiresIn - 60) * 1000) };
    
    logger.info('Generated new K2 Connect OAuth token', { expiresIn });
    return token;
  } catch (err) {
    tokenCache = { token: null, expiresAt: null };
    logger.error('K2 token generation failed', { error: err.response?.data || err.message });
    throw new Error('Failed to authenticate with K2 Connect API');
  }
};

// ==========================================
// HELPER: Format phone to 254XXXXXXXXX
// ==========================================
const formatPhoneNumber = (phone) => {
  let cleaned = String(phone).replace(/[\s\-+]/g, '');
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
  if (!cleaned.startsWith('254')) throw new Error('Invalid phone number. Must be a Kenyan number (07XX or 254XXX)');
  if (cleaned.length !== 12) throw new Error('Invalid phone number length. Must be 12 digits (254XXXXXXXXX)');
  return '+' + cleaned;
};

// ==========================================
// HELPER: Safe Activity Log
// ==========================================
const safeLog = async (data) => {
  try { await logActivity(data); } catch (_) {}
};

// ==========================================
// ROUTE 1: Initiate STK Push (Buy Goods)
// POST /api/k2/stkpush
// ==========================================
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
    const orderTotal = Math.round(parseFloat(order.total));
    if (requestedAmount !== orderTotal) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Order total is KSH ${orderTotal}, received KSH ${requestedAmount}`
      });
    }

    const token = await getK2Token();

    // Build STK Push payload for Buy Goods
    const stkData = {
      payment_channel: 'M-PESA STK Push',
      till_number: K2_CONFIG.tillNumber,
      subscriber: {
        phone_number: formattedPhone,
        first_name: order.customer_name.split(' ')[0],
        last_name: order.customer_name.split(' ').slice(1).join(' ') || 'Customer'
      },
      amount: {
        currency: 'KES',
        value: requestedAmount
      },
      metadata: {
        order_id: orderId.toString(),
        customer_email: order.email,
        reference: `Order-${orderId}`
      },
      _links: {
        callback_url: K2_CONFIG.callbackUrl
      }
    };

    logger.info('Initiating K2 STK Push', { orderId, phone: formattedPhone, amount: requestedAmount });

    let k2Response;
    try {
      k2Response = await axios.post(
        `${getBaseUrl()}/api/v1/incoming_payments`,
        stkData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'K2-Api-Key': K2_CONFIG.apiKey
          },
          timeout: 30000
        }
      );
    } catch (axiosErr) {
      const errData = axiosErr.response?.data;
      const errMsg = errData?.error_message || axiosErr.message;
      logger.error('K2 STK Push Axios error', { orderId, error: errMsg, data: errData });
      return res.status(502).json({
        success: false,
        message: `K2 Connect request failed: ${errMsg}. Please try again.`
      });
    }

    // K2 returns a location header with the payment request resource
    const resourceLocation = k2Response.headers.location;
    const paymentRequestId = resourceLocation ? resourceLocation.split('/').pop() : null;

    if (!paymentRequestId) {
      logger.error('K2 STK Push: No payment request ID returned', { orderId });
      return res.status(502).json({ success: false, message: 'Failed to initiate payment' });
    }

    // Persist payment record in mpesa_payments table (reusing existing table structure)
    await connection.query(
      `INSERT INTO mpesa_payments
       (order_id, checkout_request_id, merchant_request_id, phone_number, amount, status, expires_at)
       VALUES (?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
      [orderId, paymentRequestId, paymentRequestId, formattedPhone, requestedAmount]
    );

    if (order.status === 'pending') {
      await connection.query(
        'UPDATE orders SET status = ?, payment_method = ? WHERE id = ?',
        ['payment_requested', 'mpesa', orderId]
      );
    }

    logger.info('K2 STK Push initiated successfully', { orderId, paymentRequestId });

    return res.status(200).json({
      success: true,
      message: 'STK Push sent. Please check your phone.',
      checkoutRequestId: paymentRequestId,
      merchantRequestId: paymentRequestId
    });

  } catch (error) {
    logger.error('K2 STK Push unhandled error', { error: error.message, stack: error.stack });
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
// ROUTE 2: K2 Connect Webhook Handler
// POST /api/k2/webhook
// ==========================================
exports.handleWebhook = async (req, res) => {
  // Acknowledge K2 immediately
  res.status(200).json({ status: 'received' });

  let connection;
  try {
    connection = await db.getConnection();
  } catch (dbErr) {
    logger.error('K2 Webhook: DB connection failed', { error: dbErr.message });
    return;
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-kopokopo-signature'];
    if (K2_CONFIG.webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', K2_CONFIG.webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        logger.error('K2 Webhook: Invalid signature');
        return;
      }
    }

    const event = req.body;
    logger.info('K2 Webhook received', { eventType: event.event_type, topic: event.topic });

    // Handle payment events
    if (event.topic === 'buygoods_transaction_received') {
      const eventData = event.event;
      const resourceUrl = eventData?.resource?._links?.self;

      if (!resourceUrl) {
        logger.error('K2 Webhook: No resource URL in event');
        return;
      }

      // Fetch payment details from K2
      const token = await getK2Token();
      const paymentDetails = await axios.get(resourceUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'K2-Api-Key': K2_CONFIG.apiKey
        }
      });

      const payment = paymentDetails.data;
      const metadata = payment.metadata || {};
      const orderId = parseInt(metadata.order_id);
      const amount = parseInt(payment.amount?.value || 0);
      const reference = payment.reference;
      const mpesaReference = payment.origination_time || payment.sender_phone_number;

      if (!orderId) {
        logger.warn('K2 Webhook: No order ID in metadata');
        return;
      }

      // Find payment record by order_id
      const [payments] = await connection.query(
        'SELECT * FROM mpesa_payments WHERE order_id = ? AND status = ?',
        [orderId, 'pending']
      );

      if (payments.length === 0) {
        logger.warn('K2 Webhook: Payment record not found', { orderId });
        return;
      }

      const paymentRecord = payments[0];

      await connection.beginTransaction();

      try {
        // Verify amount matches
        const expected = Math.round(parseFloat(paymentRecord.amount));
        const received = amount;

        if (received !== expected) {
          logger.error('K2 Webhook: Amount mismatch', { orderId, expected, received });
          await connection.query(
            `UPDATE mpesa_payments SET result_code=1, result_desc=?, status='failed' WHERE id=?`,
            [`Amount mismatch: expected ${expected}, received ${received}`, paymentRecord.id]
          );
          await connection.commit();
          return;
        }

        // Check for duplicate
        const [dup] = await connection.query(
          'SELECT id FROM mpesa_payments WHERE mpesa_receipt_number = ? AND id != ?',
          [reference, paymentRecord.id]
        );
        if (dup.length > 0) {
          logger.warn('K2 Webhook: Duplicate reference', { reference, orderId });
          await connection.rollback();
          return;
        }

        // Verify order is payable
        const [currentOrder] = await connection.query('SELECT status FROM orders WHERE id = ?', [orderId]);
        if (!currentOrder.length || !['pending', 'payment_requested'].includes(currentOrder[0].status)) {
          logger.warn('K2 Webhook: Order not payable', { orderId, status: currentOrder[0]?.status });
          await connection.rollback();
          return;
        }

        // Mark payment as successful
        await connection.query(
          `UPDATE mpesa_payments
           SET mpesa_receipt_number=?, transaction_date=NOW(), result_code=0, result_desc='Success', status='success'
           WHERE id=?`,
          [reference, paymentRecord.id]
        );

        await connection.query(
          'UPDATE orders SET status=?, mpesa_receipt=?, payment_method=? WHERE id=?',
          ['paid', reference, 'mpesa', orderId]
        );

        await connection.commit();

        logger.info('K2 Payment marked as successful', { orderId, reference });

        // Send email notification
        setImmediate(async () => {
          await safeLog({
            userId: null, userName: 'K2 Connect',
            action: 'PAYMENT_COMPLETED', resourceType: 'order', resourceId: orderId,
            description: `K2 Connect payment completed. Reference: ${reference}, Amount: KSH ${amount}`,
            ip: req.ip
          });

          try {
            const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
            if (rows.length > 0) {
              const orderRow = rows[0];
              const [items] = await db.query(
                `SELECT oi.*, COALESCE(oi.item_name, p.name) as name
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [orderId]
              );
              const receiptHTML = generateReceiptHTML(orderRow, items);
              const tmpl = paymentConfirmedTemplate(orderRow, receiptHTML);
              await sendEmail({
                to: orderRow.email,
                subject: tmpl.subject,
                html: tmpl.html,
                attachments: tmpl.attachments
              });
            }
          } catch (emailErr) {
            logger.error('K2 payment confirmation email failed', { orderId, error: emailErr.message });
          }
        });

      } catch (innerErr) {
        await connection.rollback();
        logger.error('K2 Webhook: Inner processing error', { error: innerErr.message, stack: innerErr.stack });
      }
    }

  } catch (outerErr) {
    logger.error('K2 Webhook: Outer unhandled error', { error: outerErr.message, stack: outerErr.stack });
  } finally {
    if (connection) connection.release();
  }
};

// ==========================================
// ROUTE 3: Poll Payment Status
// GET /api/k2/status/:paymentRequestId
// ==========================================
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
        resultDescription: p.result_desc
      }
    });
  } catch (error) {
    logger.error('K2 payment status check error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to check payment status' });
  }
};

// ==========================================
// ROUTE 4: Order Payment History
// GET /api/k2/order/:orderId/payments
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
        id: p.id,
        checkoutRequestId: p.checkout_request_id,
        phoneNumber: p.phone_number,
        amount: parseFloat(p.amount),
        status: p.status,
        mpesaReceipt: p.mpesa_receipt_number,
        transactionDate: p.transaction_date,
        resultDescription: p.result_desc,
        createdAt: p.created_at
      }))
    });
  } catch (error) {
    logger.error('Get K2 order payments error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to retrieve payment history' });
  }
};
