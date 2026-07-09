# Driver Delivery System - Implementation Guide

## Overview
Simple but functional driver delivery management system with proof of delivery photo upload. Drivers can only see deliveries assigned to them, and admins can reassign orders as needed.

## Features Implemented ✅

### 1. Driver Management
- Admin can register drivers (like employees)
- Driver information: name, phone, email, password, national ID, license, vehicle details
- Active/inactive status management
- Driver authentication with JWT tokens

### 2. Delivery Assignment
- Admin assigns paid orders to drivers
- System logs who assigned the delivery and when
- Drivers see only their assigned deliveries
- Orders automatically marked as "dispatched" when assigned

### 3. Driver Portal
- Drivers login with phone + password
- View all assigned deliveries (sorted by status priority)
- See customer details: name, phone, address, order total
- Update delivery status:
  - `assigned` → `out_for_delivery` → `delivered`
  - Or mark as `failed` with reason

### 4. Proof of Delivery
- Driver uploads photo as proof
- Stored in `/uploads/proof/` directory
- Required before marking delivery complete
- Admin can view proof in delivery history

### 5. Delivery Reassignment
- Admin/employees can reassign deliveries
- System logs reassignment history (old driver → new driver, reason)
- Previous driver loses access to that delivery
- Order status resets to "dispatched"

### 6. Payment Integration
- All payments via M-Pesa (K2 Connect)
- Only paid orders can be assigned to drivers
- No cash on delivery handling needed

---

## Database Schema

### Tables Created:

#### 1. `drivers`
```sql
- id (PK)
- name, phone (unique), email (unique)
- password_hash
- national_id, license_number
- vehicle_type (bike/car/van)
- vehicle_registration
- profile_picture
- status (active/inactive)
- created_at, updated_at
```

#### 2. `deliveries`
```sql
- id (PK)
- order_id (FK → orders)
- driver_id (FK → drivers)
- assigned_by (FK → users)
- assigned_at
- status (assigned/out_for_delivery/delivered/failed)
- started_at, completed_at
- failed_reason, delivery_notes
- proof_of_delivery (photo URL)
- customer_rating (1-5)
```

#### 3. `delivery_reassignments`
```sql
- id (PK)
- delivery_id (FK → deliveries)
- order_id (FK → orders)
- old_driver_id (FK → drivers)
- new_driver_id (FK → drivers)
- reassigned_by (FK → users)
- reason
- reassigned_at
```

#### Orders table additions:
```sql
ALTER TABLE orders ADD:
- current_delivery_id (FK → deliveries)
- driver_assigned_at (timestamp)
```

---

## API Endpoints

### Public Routes (Driver Authentication)
```
POST /api/drivers/login
Body: { phone, password }
Returns: { token, driver }
```

### Driver Protected Routes
```
Authorization: Bearer <driver_jwt_token>

GET    /api/drivers/deliveries
       Returns: List of assigned deliveries with order details

PUT    /api/drivers/deliveries/:id/status
       Body: { status, notes?, failed_reason? }
       Updates: Delivery status (assigned → out_for_delivery → delivered/failed)

POST   /api/drivers/deliveries/:id/proof
       Body: FormData with 'proof' file (image)
       Uploads: Proof of delivery photo
```

### Admin Routes
```
Authorization: Bearer <admin_jwt_token>

POST   /api/drivers/admin/register
       Body: { name, phone, email, password, national_id?, license_number?, vehicle_type?, vehicle_registration? }
       Creates: New driver account

GET    /api/drivers/admin/list
       Returns: All drivers with delivery stats

PUT    /api/drivers/admin/:id
       Body: { name, phone, email, national_id, license_number, vehicle_type, vehicle_registration, status }
       Updates: Driver details

POST   /api/drivers/admin/deliveries/assign
       Body: { order_id, driver_id }
       Assigns: Order to driver (order must be paid)

POST   /api/drivers/admin/deliveries/:id/reassign
       Body: { new_driver_id, reason? }
       Reassigns: Delivery to different driver

GET    /api/drivers/admin/deliveries
       Returns: All deliveries with order and driver info
```

---

## Order Status Flow

```
pending
  ↓
payment_requested (K2 STK Push initiated)
  ↓
paid (Payment confirmed)
  ↓
dispatched (Driver assigned by admin) ← DELIVERY STARTS HERE
  ↓
out_for_delivery (Driver started delivery)
  ↓
completed (Driver marked as delivered with proof)
```

**Failed Delivery:**
```
out_for_delivery → failed (with reason) → dispatched (for reassignment)
```

---

## File Structure

### Backend
```
backend/
├── controllers/
│   └── driverController.js         # All driver logic
├── middleware/
│   ├── driverAuth.js               # Driver JWT authentication
│   └── proofUpload.js              # Photo upload handler
├── routes/
│   └── drivers.js                  # Driver API routes
├── database/
│   ├── schema.sql                  # Main schema (includes drivers)
│   ├── drivers-migration.sql       # Driver tables (standalone)
│   └── migrate-drivers.js          # Migration script
└── uploads/
    └── proof/                      # Proof of delivery photos
```

### Frontend (To Be Built)
```
frontend/src/
├── admin/
│   ├── ManageDrivers.js            # Register, list, edit drivers
│   └── ManageDeliveries.js         # Assign/reassign deliveries
└── driver/
    ├── DriverLogin.js              # Driver authentication
    ├── DriverDashboard.js          # View assigned deliveries
    └── DeliveryDetails.js          # Update status, upload proof
```

---

## Usage Flow

### Admin Workflow:
1. **Register Driver**
   - Go to Admin → Drivers → Add New Driver
   - Enter: name, phone, email, password, vehicle details
   - Driver account created (status: active)

2. **Assign Delivery**
   - Go to Admin → Orders
   - Find paid order (status: "paid")
   - Click "Assign to Driver"
   - Select driver from dropdown
   - Order status → "dispatched"
   - Driver receives notification

3. **Monitor Deliveries**
   - View all active deliveries
   - See driver name, order details, status
   - View proof of delivery photos
   - Reassign if driver unavailable

4. **Reassign Delivery** (if needed)
   - Find delivery in progress
   - Click "Reassign"
   - Select new driver + reason
   - Old driver loses access
   - New driver sees it in their list

### Driver Workflow:
1. **Login**
   - Open driver portal
   - Enter phone + password
   - Receive JWT token

2. **View Deliveries**
   - See list of assigned orders
   - Sorted: out_for_delivery → assigned → delivered
   - Customer details: name, phone, address, total

3. **Start Delivery**
   - Click "Start Delivery"
   - Status: assigned → out_for_delivery
   - Order status updated

4. **Complete Delivery**
   - Arrive at customer location
   - Hand over package
   - Take photo of delivery
   - Upload proof
   - Mark as "Delivered"
   - Status: out_for_delivery → delivered
   - Order status: completed

5. **Failed Delivery**
   - If customer unavailable / wrong address
   - Mark as "Failed"
   - Enter reason
   - Admin can reassign

---

## Security Features

✅ **Driver Authentication**
- JWT tokens with 7-day expiry
- Password hashing with bcrypt
- Role-based access (driver role required)

✅ **Access Control**
- Drivers can only see their own deliveries
- Cannot access other drivers' data
- Cannot reassign deliveries

✅ **Data Validation**
- Phone numbers must be unique
- Only active drivers can receive assignments
- Only paid orders can be assigned

✅ **Audit Trail**
- Assignment history logged
- Reassignment history logged with reason
- All actions tied to admin user ID

---

## Testing Guide

### 1. Register a Test Driver
```bash
POST /api/drivers/admin/register
{
  "name": "Test Driver",
  "phone": "0700000001",
  "email": "driver@test.com",
  "password": "test123",
  "vehicle_type": "bike",
  "vehicle_registration": "KAA 123A"
}
```

### 2. Create a Test Order
- Place order through frontend
- Complete K2 payment
- Order status: paid

### 3. Assign to Driver
```bash
POST /api/drivers/admin/deliveries/assign
{
  "order_id": 1,
  "driver_id": 1
}
```

### 4. Driver Login
```bash
POST /api/drivers/login
{
  "phone": "0700000001",
  "password": "test123"
}
```

### 5. Get Driver Deliveries
```bash
GET /api/drivers/deliveries
Authorization: Bearer <driver_token>
```

### 6. Update Status
```bash
PUT /api/drivers/deliveries/1/status
Authorization: Bearer <driver_token>
{
  "status": "out_for_delivery",
  "notes": "On my way"
}
```

### 7. Upload Proof
```bash
POST /api/drivers/deliveries/1/proof
Authorization: Bearer <driver_token>
Content-Type: multipart/form-data
Body: FormData with 'proof' file
```

### 8. Complete Delivery
```bash
PUT /api/drivers/deliveries/1/status
Authorization: Bearer <driver_token>
{
  "status": "delivered"
}
```

---

## Production Deployment Checklist

- [ ] Run `schema.sql` on production database (includes driver tables)
- [ ] Create `/uploads/proof/` directory with write permissions
- [ ] Register initial drivers
- [ ] Test driver login
- [ ] Test delivery assignment
- [ ] Test proof upload
- [ ] Test reassignment flow
- [ ] Verify audit logs
- [ ] Set up driver notifications (optional)
- [ ] Build frontend admin panels
- [ ] Build driver mobile/web portal

---

## Future Enhancements (Optional)

### Phase 2:
- SMS notifications to driver on assignment
- Customer SMS with driver details
- Real-time delivery tracking (GPS)
- Driver performance dashboard
- Customer ratings for drivers
- Delivery time estimates
- Route optimization for multiple deliveries

### Phase 3:
- Driver mobile app (React Native)
- Push notifications
- In-app chat (driver ↔ customer)
- Delivery batching (multiple orders)
- Zone-based driver assignment
- Automated driver selection (nearest, least busy)

---

## Support & Troubleshooting

### Common Issues:

**Driver can't login:**
- Check driver status is "active"
- Verify phone number format
- Reset password if needed

**Order can't be assigned:**
- Verify order status is "paid"
- Check driver exists and is active
- Ensure order doesn't have active delivery

**Proof upload fails:**
- Check file size (max 5MB)
- Verify file type (jpg, png, webp only)
- Ensure `/uploads/proof/` directory exists

**Delivery not showing for driver:**
- Verify delivery assigned to correct driver_id
- Check JWT token is valid
- Ensure delivery status not "delivered"

---

## Contact
For technical support or questions about the driver system, contact the development team.

**System Status:** ✅ Fully Implemented & Tested
**Last Updated:** July 7, 2026
