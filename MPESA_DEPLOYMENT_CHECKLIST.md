# M-Pesa Integration Deployment Checklist

## Pre-Deployment Setup

### 1. Database Migration ✅
Run the M-Pesa migration script on your production database:

**Option A: Using Node.js script (recommended)**
```bash
cd backend
node migrate-mpesa.js
```

**Option B: Using MySQL client**
```bash
mysql -u your_user -p your_database < backend/database/mpesa-migration.sql
```

**Option C: Using phpMyAdmin**
1. Open phpMyAdmin
2. Select your database
3. Go to SQL tab
4. Copy and paste contents of `backend/database/mpesa-migration.sql`
5. Click "Go"

### 2. Safaricom Daraja Setup 📱
1. Go to [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Log in or create an account
3. Create a new app:
   - **Sandbox** (for testing) OR **Production** (for live)
4. Link your Till Number: **3611027**
5. Note down:
   - Consumer Key
   - Consumer Secret
   - Passkey (for STK Push)

### 3. Environment Variables 🔐
Add these to your `backend/.env` file:

```env
# M-PESA DARAJA API
MPESA_ENVIRONMENT=production  # or 'sandbox' for testing
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORT_CODE=3611027
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://esena.co.ke/api/mpesa/callback
```

**⚠️ Important:** 
- `MPESA_CALLBACK_URL` **must** be HTTPS (not HTTP)
- Use your actual production domain
- No trailing slash in the URL

### 4. SSL Certificate Verification 🔒
Ensure your domain has a valid SSL certificate:
```bash
curl https://esena.co.ke/api/mpesa/callback
```

You should get a response (not an SSL error). If you get an SSL warning, fix your certificate first.

### 5. Test Callback URL Accessibility 🌐
Verify Safaricom can reach your server:
```bash
curl -X POST https://esena.co.ke/api/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{"Body":{"stkCallback":{"ResultCode":0}}}'
```

Expected response:
```json
{"ResultCode":0,"ResultDescription":"Success"}
```

---

## Deployment Steps

### Backend Deployment

1. **Commit and push to git:**
   ```bash
   git add .
   git commit -m "Add M-Pesa Daraja API integration"
   git push origin mpesa_integration
   ```

2. **Merge to main:**
   ```bash
   git checkout main
   git merge mpesa_integration
   git push origin main
   ```

3. **Deploy to production server:**
   - If using cPanel: Upload files via File Manager or FTP
   - If using git on server: `git pull origin main`

4. **Install dependencies (if needed):**
   ```bash
   cd backend
   npm install
   ```

5. **Run migration:**
   ```bash
   node migrate-mpesa.js
   ```

6. **Restart Node.js app:**
   - cPanel: Restart app from Node.js Selector
   - PM2: `pm2 restart esena-backend`
   - SystemD: `sudo systemctl restart esena-backend`

### Frontend Deployment

1. **Build the React app:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy build folder:**
   - Copy `frontend/build/*` to your web root
   - Update API URL if different from default

---

## Testing Checklist

### Sandbox Testing (Before Going Live)

1. ✅ Create a test order with M-Pesa payment method
2. ✅ STK Push received on test phone: `254708374149`
3. ✅ Enter PIN and confirm payment
4. ✅ Order status updates to `paid` automatically
5. ✅ M-Pesa receipt saved in database
6. ✅ Customer receives payment confirmation email
7. ✅ Admin can see payment in order details

### Production Testing

1. ✅ Switch `MPESA_ENVIRONMENT=production` in `.env`
2. ✅ Update Daraja credentials to **Production App**
3. ✅ Test with a **real payment** (small amount like KSH 10)
4. ✅ Verify STK Push on real phone
5. ✅ Complete payment and verify order status
6. ✅ Check database for payment record
7. ✅ Verify emails sent correctly

---

## Monitoring & Maintenance

### Check Payment Status
```sql
SELECT o.id, o.customer_name, o.status, o.mpesa_receipt, 
       mp.checkout_request_id, mp.status as payment_status, mp.amount
FROM orders o
LEFT JOIN mpesa_payments mp ON o.id = mp.order_id
WHERE o.payment_method = 'mpesa'
ORDER BY o.created_at DESC
LIMIT 20;
```

### Clean Up Expired Pending Payments (Optional)
Run this periodically (e.g., daily cron job):
```sql
DELETE FROM mpesa_payments 
WHERE status = 'pending' 
AND expires_at < NOW();
```

### Monitor Failed Payments
```sql
SELECT * FROM mpesa_payments 
WHERE status IN ('failed', 'cancelled')
ORDER BY created_at DESC
LIMIT 50;
```

---

## Troubleshooting

### Issue: Callback not received
**Solution:**
1. Check server logs: `tail -f backend/logs/application-*.log`
2. Verify HTTPS works: `curl https://esena.co.ke/api/mpesa/callback`
3. Check firewall allows inbound HTTPS
4. Verify no trailing slash in `MPESA_CALLBACK_URL`

### Issue: STK Push not sending
**Solution:**
1. Check M-Pesa credentials in `.env`
2. Verify `MPESA_ENVIRONMENT` matches your Daraja app (sandbox vs production)
3. Check phone number format (254XXXXXXXXX)
4. Review backend logs for errors

### Issue: Payment stuck in "pending"
**Solution:**
- Payments auto-expire after 2 minutes
- Customer can retry with same order
- Check if customer actually completed payment (ask for M-Pesa confirmation SMS)

### Issue: "Token generation failed"
**Solution:**
1. Verify Consumer Key and Secret are correct
2. Check if Safaricom API is down: https://developer.safaricom.co.ke/
3. Ensure server can access external HTTPS APIs (check firewall)

---

## Security Best Practices

✅ **Never** commit `.env` files to git  
✅ **Always** use HTTPS for callback URLs  
✅ **Validate** all inputs (phone numbers, amounts, order IDs)  
✅ **Log** all payment attempts for audit trails  
✅ **Check** for duplicate receipts before processing  
✅ **Limit** STK Push requests (rate limiting already configured)  
✅ **Monitor** logs for suspicious activity  

---

## Support Contacts

**Safaricom Daraja Support:**
- Email: apisupport@safaricom.co.ke
- Phone: +254 711 051 000

**Technical Documentation:**
- [Daraja Portal](https://developer.safaricom.co.ke/)
- [API Documentation](https://developer.safaricom.co.ke/docs)
- Local guide: `MPESA_INTEGRATION_GUIDE.md`

---

## Files Modified/Created

### Backend
- ✅ `backend/controllers/mpesaController.js` (new)
- ✅ `backend/routes/mpesa.js` (new)
- ✅ `backend/database/mpesa-migration.sql` (new)
- ✅ `backend/migrate-mpesa.js` (new)
- ✅ `backend/server.js` (modified - added route)
- ✅ `backend/.env.example` (modified - added M-Pesa vars)

### Frontend
- ✅ `frontend/src/components/MpesaPaymentModal.js` (new)
- ✅ `frontend/src/services/api.js` (modified - added M-Pesa API methods)
- ✅ `frontend/src/pages/Checkout.js` (modified - integrated M-Pesa)

### Documentation
- ✅ `MPESA_INTEGRATION_GUIDE.md` (new)
- ✅ `MPESA_DEPLOYMENT_CHECKLIST.md` (this file)

---

## Post-Deployment Verification

Run these checks after deploying:

1. ✅ Backend server running without errors
2. ✅ M-Pesa routes accessible: `curl https://esena.co.ke/api/mpesa/callback`
3. ✅ Database migration applied successfully
4. ✅ Environment variables set correctly (check logs for missing vars)
5. ✅ Frontend shows M-Pesa as payment option
6. ✅ Test order with sandbox credentials
7. ✅ Monitor first real payment closely

---

🎉 **Integration Complete!**

Your Esena Pharmacy system now supports M-Pesa payments with automatic order confirmation. Customers can pay instantly using their phones, and orders will update in real-time.
