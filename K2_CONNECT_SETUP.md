# K2 Connect (Kopo Kopo) Integration Setup Guide

## Overview
The system has been switched from M-Pesa Daraja API to **K2 Connect by Kopo Kopo** for Buy Goods (Till Number) payments. K2 Connect provides a simpler, more reliable API for accepting M-Pesa payments to your till number.

---

## ✅ Changes Made

### Backend:
1. ✅ Created `/backend/controllers/k2Controller.js` - Full K2 Connect implementation
2. ✅ Created `/backend/routes/k2.js` - K2 API routes
3. ✅ Updated `/backend/server.js` - Registered K2 routes
4. ✅ Updated `/backend/.env` - Added K2 configuration

### Frontend:
1. ✅ Updated `/frontend/src/services/api.js` - Changed mpesaAPI to use K2 endpoints

### Database:
- ✅ **No changes needed** - Reusing existing `mpesa_payments` table

---

## 🔧 Setup Instructions

### Step 1: Get K2 Connect Credentials

1. **Sign up** for K2 Connect: https://app.kopokopo.com/signup
2. **Verify** your business and till number (3611027)
3. Go to **Settings > API Keys** and get:
   - Client ID
   - Client Secret
   - API Key
   - Webhook Secret (create one)

### Step 2: Update Environment Variables

Edit `/backend/.env` and replace these placeholders:

```bash
# K2 Connect Production Credentials
K2_ENVIRONMENT=production
K2_CLIENT_ID=your_actual_client_id_here
K2_CLIENT_SECRET=your_actual_client_secret_here
K2_API_KEY=your_actual_api_key_here
K2_TILL_NUMBER=3611027
K2_WEBHOOK_SECRET=your_webhook_secret_here
K2_CALLBACK_URL=https://esena.co.ke/api/k2/webhook
```

**For Testing (Sandbox):**
```bash
K2_ENVIRONMENT=sandbox
K2_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/k2/webhook
```

### Step 3: Configure Webhook in K2 Dashboard

1. Log into K2 Connect dashboard
2. Go to **Settings > Webhooks**
3. Add webhook URL: `https://esena.co.ke/api/k2/webhook`
4. Select events: **Buy Goods Transaction Received**
5. Save and activate

### Step 4: Test the Integration

#### Sandbox Testing:
1. Start backend: `npm start`
2. Use ngrok to expose local server: `ngrok http 5000`
3. Update `K2_CALLBACK_URL` with ngrok URL
4. Test with K2 sandbox phone numbers

#### Production Testing:
1. Make a small test purchase (e.g., KSH 10)
2. Complete M-Pesa payment to till 3611027
3. Verify:
   - Payment status updates in database
   - Order status changes to "paid"
   - Customer receives confirmation email
   - Receipt is generated

---

## 🔄 How K2 Connect Works

### Payment Flow:

```
1. Customer → Clicks "Pay with M-Pesa"
2. Frontend → POST /api/k2/stkpush (orderId, phone, amount)
3. Backend → Calls K2 API to trigger STK Push
4. K2 → Sends STK Push to customer's phone
5. Customer → Enters M-Pesa PIN
6. K2 → Receives payment notification
7. K2 → Calls your webhook /api/k2/webhook
8. Backend → Verifies payment, updates order status
9. Backend → Sends confirmation email with receipt
10. Frontend → Polls /api/k2/status/{id} for status updates
```

### Key Differences from Daraja:

| Feature | M-Pesa Daraja | K2 Connect |
|---------|---------------|------------|
| **Transaction Type** | CustomerBuyGoodsOnline | Buy Goods (automatic) |
| **Webhook** | Optional callback | Required webhook |
| **Authentication** | OAuth + Passkey | OAuth only |
| **Till Support** | Limited | Full support |
| **Complexity** | High | Low |
| **Reliability** | Medium | High |

---

## 📊 Database Schema

**No changes needed!** K2 Connect reuses the existing `mpesa_payments` table:

```sql
mpesa_payments (
  id INT PRIMARY KEY,
  order_id INT,
  checkout_request_id VARCHAR(100), -- K2 payment request ID
  merchant_request_id VARCHAR(100), -- Same as checkout_request_id for K2
  phone_number VARCHAR(20),
  amount DECIMAL(10,2),
  mpesa_receipt_number VARCHAR(50), -- K2 reference/receipt
  transaction_date DATETIME,
  result_code INT,
  result_desc VARCHAR(255),
  status ENUM('pending','success','failed','cancelled'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## 🧪 Testing Guide

### Test Buy Goods Payment:

```bash
# 1. Start backend
cd backend
npm start

# 2. Test STK Push endpoint
curl -X POST http://localhost:5000/api/k2/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "phoneNumber": "254712345678",
    "amount": 150
  }'

# Expected Response:
{
  "success": true,
  "message": "STK Push sent. Please check your phone.",
  "checkoutRequestId": "payment_request_uuid",
  "merchantRequestId": "payment_request_uuid"
}

# 3. Check payment status
curl http://localhost:5000/api/k2/status/payment_request_uuid

# Expected Response:
{
  "success": true,
  "payment": {
    "orderId": 1,
    "orderToken": "ABC123",
    "status": "pending|success|failed",
    "amount": 150,
    "phoneNumber": "+254712345678",
    "mpesaReceipt": "QR12345678",
    "transactionDate": "2026-07-06T...",
    "resultDescription": "Success"
  }
}
```

### Test Webhook:

```bash
# Simulate K2 webhook call
curl -X POST http://localhost:5000/api/k2/webhook \
  -H "Content-Type: application/json" \
  -H "X-KopoKopo-Signature: test_signature" \
  -d '{
    "event_type": "buygoods_transaction_received",
    "topic": "buygoods_transaction_received",
    "event": {
      "resource": {
        "_links": {
          "self": "https://api.kopokopo.com/api/v1/incoming_payments/payment_id"
        }
      }
    }
  }'
```

---

## 🔐 Security Notes

1. **Webhook Secret**: Always verify webhook signatures in production
2. **HTTPS Only**: K2 webhooks require HTTPS
3. **Amount Validation**: Backend verifies amount matches order total
4. **Duplicate Prevention**: Checks for duplicate M-Pesa receipts
5. **Status Guards**: Ensures orders are in payable state before updating

---

## 🐛 Troubleshooting

### STK Push Not Received:
- Verify till number is correct (3611027)
- Check phone number format (+254XXXXXXXXX)
- Ensure K2 credentials are valid
- Check K2 dashboard for API logs

### Webhook Not Firing:
- Verify webhook URL is publicly accessible (HTTPS)
- Check K2 dashboard webhook logs
- Ensure webhook is activated
- Verify signature validation isn't blocking

### Payment Status Stuck on "Pending":
- Check backend logs for webhook errors
- Verify webhook signature validation
- Check database `mpesa_payments` table for errors
- Review K2 dashboard transaction history

### Database Connection Issues:
- Verify MySQL is running (XAMPP)
- Check `.env` database credentials
- Restart backend server

---

## 📞 Support

- **K2 Connect Docs**: https://docs.kopokopo.com
- **K2 Support**: support@kopokopo.com
- **Integration Help**: Check K2 dashboard API logs

---

## 🚀 Going Live Checklist

- [ ] Get production K2 Connect credentials
- [ ] Update `.env` with production values
- [ ] Set `K2_ENVIRONMENT=production`
- [ ] Configure production webhook URL
- [ ] Test small transaction (KSH 10-50)
- [ ] Verify email notifications work
- [ ] Monitor first few live transactions
- [ ] Keep M-Pesa Daraja as backup (optional)

---

**Status**: ✅ Integration Complete - Ready for Testing
**Date**: 2026-07-06
