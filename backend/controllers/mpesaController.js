const axios = require('axios');
const db = require('../config/db');
const { logger } = require('../utils/logger');
const { logActivity } = require('../utils/activityLog');
const { 
  sendEmail, 
  paymentConfirmedTemplate 
} = require('../config/mail');

// ==========================================
// M-PESA CONFIGURATION
// ==========================================
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '3611027',
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox', // 'sandbox' or 'production'
};

// OAuth token cache (valid for 3599 seconds = ~1 hour)
let tokenCache = {
  token: null,
  expiresAt: null
};

// ==========================================
// HELPER: Get Base URL based on environment
// ==========================================
const getBaseUrl = () => {
  return MPESA_CONFIG.environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
};

// ==========================================
// HELPER: Generate M-Pesa Access Token with Caching
// ==========================================
const getMpesaToken = async () => {
  // Return cached token if still valid
  if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
    logger.debug('Using cached M-Pesa token');
    return tokenCache.token;
  }

  // Generate new token
  const auth = Buffer.from(
    `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
  ).toString('base64');

  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 10000
      }
    );

    const token = response.data.access_token;
    const expiresIn = parseInt(response.data.expires_in) || 3599;

    // Cache token with 60-second buffer before expiry
    tokenCache = {
      token,
      expiresAt: Date.now() + ((expiresIn - 60) * 1000)
    };

    logger.info('Generated new M-Pesa OAuth token', { expiresIn });
    return token;
  } catch (error) {
    logger.error('M-Pesa token generation failed', {
      error: error.response?.data || error.message
    });
    throw new Error('Failed to authenticate with M-Pesa API');
  }
};

// ==========================================
// HELPER: Format Phone Number to 254XXXXXXXXX
// ==========================================
const formatPhoneNumber = (phone) => {
  // Remove spaces, dashes, and plus signs
  let cleaned = phone.replace(/[\s\-+]/g, '');
  
  // Convert 07XX to 2547XX or 01XX to 2541XX
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  // Ensure it starts with 254
  if (!cleaned.startsWith('254')) {
    throw new Error('Invalid phone number format. Must be a Kenyan number (07XX or 254XXX)');
  }
  
  // Validate length (should be 254 + 9 digits = 12 total)
  if (cleaned.length !== 12) {
    throw new Error('Invalid phone number length. Must be 12 digits (254XXXXXXXXX)');
  }
  
  return cleaned;
};

// ==========================================
// HELPER: Generate Timestamp (YYYYMMDDHHmmss)
// ==========================================
const generateTimestamp = () => {
  const date = new Date();
  return (
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2)
  );
};

// ==========================================
// HELPER: Generate M-Pesa Password
// ==========================================
const generatePassword = (timestamp) => {
  const str = `${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`;
  return Buffer.from(str).toString('base64');
};

// ==========================================
// ROUTE 1: Initiate STK Push (Trigger Payment)
// POST /api/mpesa/stkpush
// ==========================================
exports.initiateSTKPush = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { orderId, phoneNumber, amount } = req.body;

    // Validate required fields
    if (!orderId || !phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, phoneNumber, amount'
      });
    }

    // Validate order exists and is in valid state for payment
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Only allow payment for pending or payment_requested orders
    if (!['pending', 'payment_requested'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot process payment for order with status '${order.status}'`
      });
    }

    // Format phone number
    let formattedPhone;
    try {
      formattedPhone = formatPhoneNumber(phoneNumber);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Validate amount matches order total
    const requestedAmount = Math.round(parseFloat(amount));
    const orderTotal = Math.round(parseFloat(order.total));

    if (requestedAmount !== orderTotal) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Order total is KSH ${orderTotal}, but received KSH ${requestedAmount}`
      });
    }

    // Generate M-Pesa request parameters
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);
    const token = await getMpesaToken();

    // Prepare STK Push request
    const stkData = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline', // For Till Number
      Amount: requestedAmount,
      PartyA: formattedPhone, // Customer phone
      PartyB: MPESA_CONFIG.businessShortCode, // Till Number
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: `Order-${orderId}`,
      TransactionDesc: `Payment for Order #${orderId}`
    };

    logger.info('Initiating M-Pesa STK Push', {
      orderId,
      phone: formattedPhone,
      amount: requestedAmount
    });

    // Send STK Push request to M-Pesa
    const baseUrl = getBaseUrl();
    const response = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      stkData,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
      }
    );

    const { CheckoutRequestID, MerchantRequestID, ResponseCode, ResponseDescription } = response.data;

    if (ResponseCode !== '0') {
      logger.error('M-Pesa STK Push failed', {
        orderId,
        responseCode: ResponseCode,
        responseDescription: ResponseDescription
      });

      return res.status(400).json({
        success: false,
        message: ResponseDescription || 'STK Push failed'
      });
    }

    // Save payment record in database
    await connection.query(
      `INSERT INTO mpesa_payments 
       (order_id, checkout_request_id, merchant_request_id, phone_number, amount, status, expires_at)
       VALUES (?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 2 MINUTE))`,
      [orderId, CheckoutRequestID, MerchantRequestID, formattedPhone, requestedAmount]
    );

    // Update order status to payment_requested if it's still pending
    if (order.status === 'pending') {
      await connection.query(
        'UPDATE orders SET status = ?, payment_method = ? WHERE id = ?',
        ['payment_requested', 'mpesa', orderId]
      );
    }

    logger.info('STK Push initiated successfully', {
      orderId,
      checkoutRequestId: CheckoutRequestID
    });

    res.status(200).json({
      success: true,
      message: 'STK Push sent successfully. Please check your phone.',
      checkoutRequestId: CheckoutRequestID,
      merchantRequestId: MerchantRequestID
    });

  } catch (error) {
    logger.error('STK Push error', {
      error: error.response?.data || error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

// ==========================================
// ROUTE 2: M-Pesa Callback Handler
// POST /api/mpesa/callback
// ==========================================
exports.handleCallback = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const callbackData = req.body?.Body?.stkCallback;

    if (!callbackData) {
      logger.error('Invalid callback data structure', { body: req.body });
      return res.status(400).json({
        ResultCode: 1,
        ResultDescription: 'Invalid callback data'
      });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc
    } = callbackData;

    logger.info('M-Pesa callback received', {
      checkoutRequestId: CheckoutRequestID,
      resultCode: ResultCode,
      resultDesc: ResultDesc
    });

    // Find the payment record
    const [payments] = await connection.query(
      'SELECT * FROM mpesa_payments WHERE checkout_request_id = ?',
      [CheckoutRequestID]
    );

    if (payments.length === 0) {
      logger.error('Payment record not found for callback', {
        checkoutRequestId: CheckoutRequestID
      });
      // Still acknowledge Safaricom
      return res.status(200).json({
        ResultCode: 0,
        ResultDescription: 'Success'
      });
    }

    const payment = payments[0];
    const orderId = payment.order_id;

    await connection.beginTransaction();

    // ResultCode 0 = SUCCESS
    if (ResultCode === 0) {
      const metadata = callbackData.CallbackMetadata?.Item || [];
      const amount = metadata.find(item => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value;

      // Check for duplicate receipt (idempotency)
      const [existingReceipt] = await connection.query(
        'SELECT id FROM mpesa_payments WHERE mpesa_receipt_number = ? AND id != ?',
        [mpesaReceiptNumber, payment.id]
      );

      if (existingReceipt.length > 0) {
        logger.warn('Duplicate M-Pesa receipt detected', {
          receipt: mpesaReceiptNumber,
          orderId
        });
        await connection.rollback();
        return res.status(200).json({
          ResultCode: 0,
          ResultDescription: 'Duplicate receipt already processed'
        });
      }

      // Update payment record
      await connection.query(
        `UPDATE mpesa_payments 
         SET mpesa_receipt_number = ?, transaction_date = ?, result_code = ?, 
             result_desc = ?, status = 'success'
         WHERE id = ?`,
        [
          mpesaReceiptNumber,
          transactionDate ? new Date(transactionDate.toString()) : new Date(),
          ResultCode,
          ResultDesc,
          payment.id
        ]
      );

      // Update order status to 'paid' and store receipt
      await connection.query(
        'UPDATE orders SET status = ?, mpesa_receipt = ?, payment_method = ? WHERE id = ?',
        ['paid', mpesaReceiptNumber, 'mpesa', orderId]
      );

      await connection.commit();

      // Log activity
      await logActivity({
        userId: null,
        userName: 'M-Pesa System',
        action: 'PAYMENT_COMPLETED',
        resourceType: 'order',
        resourceId: orderId,
        description: `M-Pesa payment completed. Receipt: ${mpesaReceiptNumber}, Amount: KSH ${amount}`,
        ip: req.ip
      });

      logger.info('Payment successful', {
        orderId,
        receipt: mpesaReceiptNumber,
        amount
      });

      // Send payment confirmation email
      try {
        const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orders.length > 0) {
          const order = orders[0];
          const template = paymentConfirmedTemplate(order);
          await sendEmail({
            to: order.email,
            subject: template.subject,
            html: template.html
          });
        }
      } catch (emailError) {
        logger.error('Payment confirmation email failed', {
          orderId,
          error: emailError.message
        });
      }

    } else {
      // Payment failed or cancelled
      await connection.query(
        `UPDATE mpesa_payments 
         SET result_code = ?, result_desc = ?, status = ?
         WHERE id = ?`,
        [
          ResultCode,
          ResultDesc,
          ResultCode === 1032 ? 'cancelled' : 'failed',
          payment.id
        ]
      );

      await connection.commit();

      logger.info('Payment failed/cancelled', {
        orderId,
        resultCode: ResultCode,
        resultDesc: ResultDesc
      });

      // Log activity
      await logActivity({
        userId: null,
        userName: 'M-Pesa System',
        action: 'PAYMENT_FAILED',
        resourceType: 'order',
        resourceId: orderId,
        description: `M-Pesa payment failed. Reason: ${ResultDesc}`,
        ip: req.ip
      });
    }

    // Acknowledge Safaricom
    res.status(200).json({
      ResultCode: 0,
      ResultDescription: 'Success'
    });

  } catch (error) {
    await connection.rollback();
    logger.error('Callback processing error', {
      error: error.message,
      stack: error.stack
    });

    // Still acknowledge to prevent retries
    res.status(200).json({
      ResultCode: 0,
      ResultDescription: 'Accepted'
    });
  } finally {
    connection.release();
  }
};

// ==========================================
// ROUTE 3: Check Payment Status
// GET /api/mpesa/status/:checkoutRequestId
// ==========================================
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    const [payments] = await db.query(
      `SELECT mp.*, o.token as order_token 
       FROM mpesa_payments mp
       JOIN orders o ON mp.order_id = o.id
       WHERE mp.checkout_request_id = ?`,
      [checkoutRequestId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const payment = payments[0];

    res.json({
      success: true,
      payment: {
        orderId: payment.order_id,
        orderToken: payment.order_token,
        status: payment.status,
        amount: parseFloat(payment.amount),
        phoneNumber: payment.phone_number,
        mpesaReceipt: payment.mpesa_receipt_number,
        transactionDate: payment.transaction_date,
        resultDescription: payment.result_desc
      }
    });

  } catch (error) {
    logger.error('Payment status check error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
};

// ==========================================
// ROUTE 4: Get Order Payment History (Admin)
// GET /api/mpesa/order/:orderId/payments
// ==========================================
exports.getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [payments] = await db.query(
      'SELECT * FROM mpesa_payments WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );

    res.json({
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
    logger.error('Get order payments error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history'
    });
  }
};
