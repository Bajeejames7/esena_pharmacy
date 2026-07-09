# Driver Delivery Workflow

## Complete Step-by-Step Process

### 1. Admin Assigns Delivery
- Go to **Admin Dashboard** → **Orders** (or **Deliveries**)
- Find a **paid** order
- Click "Assign to Driver"
- Select driver from dropdown
- Click "Assign"
- ✅ Delivery is created and driver can see it

### 2. Driver Logs In
- Go to: `http://localhost:3000/driver/login` (or `https://esena.co.ke/driver/login`)
- Enter phone number and password
- Click "Sign In"
- Redirected to dashboard

### 3. Driver Sees Assigned Delivery
- Dashboard shows delivery in **Active Deliveries** section
- Card displays:
  - Order ID and token
  - Customer name, phone, address
  - Order total (KSh amount)
  - Status badge: **"assigned"** (yellow)
- Driver clicks **"View Details"**

### 4. Driver Starts Delivery (Step 1)
In the modal:
- **New Status** dropdown shows: "Start Delivery"
- Driver selects: **"Start Delivery"**
- (Optional) Add delivery notes
- Click **"Update Status"**
- ✅ Status changes to **"out_for_delivery"** (blue badge)
- Order status in admin becomes "out_for_delivery"

### 5. Driver Completes Delivery (Step 2)
- Driver clicks **"View Details"** again
- Now **New Status** dropdown shows: **"Mark as Delivered"**
- Driver selects: **"Mark as Delivered"**
- ⚠️ **Proof of Delivery Upload** section appears
- Driver clicks **"Choose File"** and selects photo
- Click **"Upload Proof"** button
- Wait for "Proof of delivery uploaded successfully!" alert
- ✅ Proof is saved
- Now driver clicks **"Update Status"**
- ✅ Delivery marked as delivered
- Order status in admin becomes "completed"

### 6. Alternative: Failed Delivery
If delivery cannot be completed:
- Select: **"Mark as Failed"**
- **Failed Reason** field appears (required)
- Enter reason (e.g., "Customer unavailable", "Wrong address")
- Click **"Update Status"**
- ✅ Delivery marked as failed
- Order status returns to "dispatched" (admin can reassign)

## Important Notes

### Proof of Delivery:
- **Required** before marking as delivered
- Uploaded to: `/backend/uploads/proof/`
- Formats: JPG, PNG, WEBP
- Max size: 5MB
- Visible in admin delivery tracking

### Password Reset:
- Driver clicks "Forgot password?" on login page
- Enters phone number
- Request sent to admin
- Admin goes to **Drivers** page
- Clicks **"Reset PW"** button next to driver
- Enters new password (min 6 characters)
- Driver can now login with new password

### Security:
- Drivers only see **their own** deliveries
- Cannot see other drivers' deliveries
- Cannot reassign orders (admin only)

## Backend Requirements

### Fixed Issues:
✅ `assigned_by` column null error - FIXED
✅ Error logging with proper error objects - FIXED  
✅ Driver password reset functionality - ADDED
✅ req.user.userId compatibility - FIXED

### Current Backend:
- Running on port 5000
- PID: 26009
- All driver routes working
- Assignment now working correctly

## Testing Checklist

- [ ] Register a new driver
- [ ] Assign a paid order to driver
- [ ] Driver logs in
- [ ] Driver sees delivery in dashboard
- [ ] Driver starts delivery (assigned → out_for_delivery)
- [ ] Driver uploads proof of delivery
- [ ] Driver marks as delivered
- [ ] Admin sees delivery as completed
- [ ] Admin sees proof of delivery photo
- [ ] Test password reset flow

## Frontend URLs

- **Driver Login**: `/driver/login`
- **Driver Dashboard**: `/driver/dashboard`
- **Admin Manage Drivers**: `/admin/drivers`
- **Admin Manage Deliveries**: `/admin/deliveries`
- **Admin Manage Orders**: `/admin/orders`

## API Endpoints

### Driver Routes:
- `POST /api/drivers/login` - Driver login
- `POST /api/drivers/request-reset` - Request password reset
- `GET /api/drivers/deliveries` - Get my deliveries (auth required)
- `PUT /api/drivers/deliveries/:id/status` - Update delivery status (auth required)
- `POST /api/drivers/deliveries/:id/proof` - Upload proof (auth required)

### Admin Routes:
- `POST /api/drivers/admin/register` - Register driver
- `GET /api/drivers/admin/list` - Get all drivers
- `PUT /api/drivers/admin/:id` - Update driver
- `PUT /api/drivers/admin/:id/reset-password` - Reset driver password
- `GET /api/drivers/admin/deliveries` - Get all deliveries
- `POST /api/drivers/admin/deliveries/assign` - Assign delivery
- `POST /api/drivers/admin/deliveries/:id/reassign` - Reassign delivery
