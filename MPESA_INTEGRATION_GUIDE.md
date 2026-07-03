# M-Pesa Integration Guide for Esena Pharmacy

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

This integration allows customers to pay for orders using M-Pesa (Kenya's mobile money platform) through Safaricom's Daraja API. The system:

✅ Triggers STK Push (popup on customer's phone)  
✅ Receives automatic payment confirmations via webhooks  
✅ Updates order status to `paid` automatically  
✅ Prevents duplicate payments  
✅ Caches OAuth tokens for 1 hour  
✅ Sends email notifications on successful payment  
✅ Tracks all payment attempts in the database  

---

## Prerequisites

### 1. Safaricom Daraja Account
- Create an account at [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
- Create a **Sandbox App** (for testing) or **Production App**
- Link your Till Number (**3611027**) to the app
- Note down:
  - Consumer Key
  - Consumer Secret
  - Passkey (for STK Push)

### 2. HTTPS Server (Required for Callback)
Safaricom requires your callback URL to be **HTTPS** (not HTTP).

**For Local Development:**
- Use [ngrok](https://ngrok.com/) to create a secure tunnel:
  ```bash
  ngrok http 5000
  ```
- Use the generated HTTPS URL (e.g., `https://abc123.ngrok.io`) as your callback URL

**For Production:**
- Ensure your domain has a valid SSL certificate (most hosting providers include this)

### 3. Database Migration
Run the M-Pesa migration to create the payments table:
```bash
mysql -u your_user -p your_database < backend/database/mpesa-migration.sql
```

Or manually execute the SQL from `backend/database/mpesa-migration.sql` in phpMyAdmin.

---

## Setup Instructions

### Step 1: Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# M-PESA DARAJA API
MPESA_ENVIRONMENT=sandbox  # Change to 'production' when going live
MPESA_CONSUMER_KEY=your_consumer_key_from_daraja
MPESA_CONSUMER_SECRET=your_consumer_secret_from_daraja
MPESA_BUSINESS_SHORT_CODE=3611027
MPESA_PASSKEY=your_passkey_from_daraja
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
```

**Local Dev Example:**
```env
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
```

### Step 2: Install Dependencies
All required dependencies (`axios`, `express`, etc.) are already in `package.json`. If starting fresh:
```bash
cd backend
npm install
```

### Step 3: Start the Server
```bash
cd backend
npm start
```

### Step 4: Test the Callback URL
Verify Safaricom can reach your callback:
```bash
curl -X POST https://your-domain.com/api/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{"Body":{"stkCallback":{"ResultCode":0}}}'
```

You should get: `{"ResultCode":0,"ResultDescription":"Success"}`

---

## API Endpoints

### 1. Initiate STK Push (Customer Payment)
**POST** `/api/mpesa/stkpush`

Triggers the M-Pesa popup on the customer's phone.

**Request Body:**
```json
{
  "orderId": 123,
  "phoneNumber": "0712345678",  // or "254712345678"
  "amount": 1500.00
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "STK Push sent successfully. Please check your phone.",
  "checkoutRequestId": "ws_CO_123456789",
  "merchantRequestId": "12345-67890-1"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid phone number format. Must be a Kenyan number (07XX or 254XXX)"
}
```

---

### 2. M-Pesa Callback (Webhook)
**POST** `/api/mpesa/callback`

Safaricom POSTs to this endpoint after the customer enters their PIN.

**⚠️ This endpoint is called by Safaricom, not your frontend.**

**Behavior:**
- ✅ Payment successful (ResultCode = 0): Updates order to `paid`, stores receipt number
- ❌ Payment failed/cancelled: Logs failure reason, does NOT change order status
- 🔁 Idempotency: Prevents duplicate receipts from being processed twice

---

### 3. Check Payment Status
**GET** `/api/mpesa/status/:checkoutRequestId`

Poll this endpoint to check if a payment has completed (useful for frontend loading states).

**Response:**
```json
{
  "success": true,
  "payment": {
    "orderId": 123,
    "orderToken": "abc123",
    "status": "success",  // 'pending', 'success', 'failed', 'cancelled'
    "amount": 1500.00,
    "phoneNumber": "254712345678",
    "mpesaReceipt": "QA12B3C4D5",
    "transactionDate": "2026-07-03T10:30:00.000Z",
    "resultDescription": "The service request is processed successfully."
  }
}
```

---

### 4. Get Order Payment History (Admin)
**GET** `/api/mpesa/order/:orderId/payments` 🔒 (Requires JWT)

Returns all payment attempts for an order.

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "checkoutRequestId": "ws_CO_123456789",
      "phoneNumber": "254712345678",
      "amount": 1500.00,
      "status": "success",
      "mpesaReceipt": "QA12B3C4D5",
      "transactionDate": "2026-07-03T10:30:00.000Z",
      "resultDescription": "Success",
      "createdAt": "2026-07-03T10:28:00.000Z"
    }
  ]
}
```

---

## Frontend Integration

### Example: Payment Button in Checkout

```javascript
import axios from 'axios';
import { useState } from 'react';

const CheckoutPage = ({ orderId, orderTotal }) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

  const handleMpesaPayment = async () => {
    setLoading(true);

    try {
      // Step 1: Initiate STK Push
      const response = await axios.post('/api/mpesa/stkpush', {
        orderId,
        phoneNumber,
        amount: orderTotal
      });

      const { checkoutRequestId } = response.data;
      setCheckoutRequestId(checkoutRequestId);

      // Step 2: Show loading message
      alert('Please check your phone and enter your M-Pesa PIN');

      // Step 3: Poll for payment status (check every 3 seconds for 2 minutes)
      const pollInterval = setInterval(async () => {
        const statusRes = await axios.get(`/api/mpesa/status/${checkoutRequestId}`);
        const { status } = statusRes.data.payment;

        if (status === 'success') {
          clearInterval(pollInterval);
          alert('Payment successful!');
          window.location.href = `/track/${statusRes.data.payment.orderToken}`;
        } else if (status === 'failed' || status === 'cancelled') {
          clearInterval(pollInterval);
          alert('Payment failed. Please try again.');
          setLoading(false);
        }
      }, 3000);

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setLoading(false);
      }, 120000);

    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Total: KSH {orderTotal}</h2>
      <input
        type="tel"
        placeholder="0712345678"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleMpesaPayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay with M-Pesa'}
      </button>
    </div>
  );
};

export default CheckoutPage;
```

---

## Testing

### Sandbox Test Credentials (Safaricom Sandbox Only)

Use these test phone numbers in sandbox mode:

| Phone Number | Result |
|--------------|--------|
| 254708374149 | ✅ Successful payment |
| 254100000000 | ❌ Payment fails |
| 254700000000 | 🔁 User cancels payment |

**Test Amount:** Any amount works in sandbox (e.g., KSH 1)

### Manual Testing Flow

1. Create an order in your system
2. Call `/api/mpesa/stkpush` with the order ID and a test phone number
3. Check your logs for "STK Push initiated successfully"
4. If using sandbox, you won't get a real phone popup, but check your callback logs
5. Verify the payment record in the `mpesa_payments` table
6. Verify the order status changed to `paid` in the `orders` table

### Debugging Tips

**Enable verbose logging:**
```bash
# In backend/.env
NODE_ENV=development
```

**Check logs:**
```bash
tail -f backend/logs/application-*.log
```

**Test callback locally:**
```bash
curl -X POST http://localhost:5000/api/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test123",
        "CheckoutRequestID": "ws_CO_test123",
        "ResultCode": 0,
        "ResultDesc": "Success",
        "CallbackMetadata": {
          "Item": [
            {"Name": "Amount", "Value": 1500},
            {"Name": "MpesaReceiptNumber", "Value": "TEST123"},
            {"Name": "TransactionDate", "Value": 20260703103000},
            {"Name": "PhoneNumber", "Value": 254712345678}
          ]
        }
      }
    }
  }'
```

---

## Production Deployment

### Checklist

- [ ] Change `MPESA_ENVIRONMENT=production` in `.env`
- [ ] Update credentials to **Production App** credentials (not sandbox)
- [ ] Set `MPESA_CALLBACK_URL` to your **production HTTPS domain**
- [ ] Test callback URL is publicly accessible:
  ```bash
  curl https://your-domain.com/api/mpesa/callback
  ```
- [ ] Verify SSL certificate is valid (no warnings in browser)
- [ ] Test with a real Kenyan phone number (small amount like KSH 10)
- [ ] Monitor logs for any errors
- [ ] Set up automated cleanup of expired pending payments (optional):
  ```sql
  DELETE FROM mpesa_payments 
  WHERE status = 'pending' 
  AND expires_at < NOW();
  ```

### Important Notes

1. **Transaction Type**: For Buy Goods Till Numbers, always use `CustomerBuyGoodsOnline` (already configured)
2. **Token Caching**: The system caches M-Pesa OAuth tokens for 1 hour to avoid rate limits
3. **Idempotency**: Duplicate `MpesaReceiptNumber` values are automatically rejected
4. **Phone Format**: System auto-converts `0712345678` to `254712345678`

---

## Troubleshooting

### Issue: "Token generation failed"
**Cause:** Invalid Consumer Key/Secret or network issue  
**Fix:** 
- Verify credentials in `.env` match your Daraja app
- Check if Safaricom API is down (check their status page)
- Ensure your server can access external HTTPS APIs

### Issue: "Callback not received"
**Cause:** Safaricom can't reach your server  
**Fix:**
- Ensure `MPESA_CALLBACK_URL` is HTTPS (not HTTP)
- Test callback URL from external tool (e.g., Postman, curl from another server)
- Check firewall/security group allows inbound HTTPS
- Verify no trailing slash in callback URL

### Issue: "Amount mismatch"
**Cause:** Order total doesn't match payment amount  
**Fix:** Always pass the exact order total (no manual editing)

### Issue: "Invalid phone number format"
**Cause:** Phone number not recognized as Kenyan  
**Fix:** 
- Use format `0712345678` or `254712345678`
- Remove spaces, dashes, country codes like `+254`

### Issue: "Order not found"
**Cause:** Order ID doesn't exist  
**Fix:** Verify the order exists in the `orders` table before calling STK Push

### Issue: Payment stuck in "pending"
**Cause:** User didn't enter PIN or callback failed  
**Fix:** 
- Payments auto-expire after 2 minutes
- User can retry payment
- Check callback logs for errors

---

## Support

For M-Pesa API issues, contact Safaricom support:
- Email: apisupport@safaricom.co.ke
- Phone: +254 711 051 000

For integration issues with this codebase:
- Check server logs: `backend/logs/application-*.log`
- Review database records: `mpesa_payments` table
- Enable debug mode: `NODE_ENV=development`

---

## Security Best Practices

✅ **Never** commit `.env` files to git (already in `.gitignore`)  
✅ **Always** use HTTPS for callback URLs  
✅ **Validate** all inputs (phone numbers, amounts, order IDs)  
✅ **Log** all payment attempts for audit trails  
✅ **Check** for duplicate receipts before processing  
✅ **Limit** STK Push requests (already has rate limiting via existing middleware)  

---

## License

This integration is part of the Esena Pharmacy system.
