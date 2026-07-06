# Profile Enhancements Implementation

## Overview

This document outlines the comprehensive enhancements made to the Esena Pharmacy system to improve user onboarding, health information collection, appointment management, and navigation.

## Features Implemented

### 1. Enhanced User Profile Collection ✅

**After Google or Manual Sign-in:**
- Users are now required to complete their profile with essential information
- Mandatory fields include:
  - Phone number
  - Delivery address
  - Closest landmark
  - City and County
  
**Health Information Collection:**
- Date of birth
- Blood type selection
- Chronic conditions (multiple selection):
  - Diabetes
  - Hypertension
  - Asthma
  - Heart Disease
  - Kidney Disease
  - Arthritis
  - Thyroid Disorder
  - Cancer
  - Epilepsy
  - Other (with text input)
- Known allergies
- Emergency contact details (name and phone)

**User Flow:**
1. User signs in with Google or creates account
2. System checks if profile is complete (`profile_completed` flag)
3. If incomplete, user is redirected to `/complete-profile`
4. User cannot proceed to checkout/account until profile is completed
5. Profile can be updated anytime from account settings

### 2. Doctor/Admin Appointment Features ✅

**Consultation Notes:**
- Doctors/admins can add notes to any appointment
- Notes include:
  - Doctor's name (auto-captured from logged-in user)
  - Consultation details, diagnosis, recommendations
  - Timestamp
  - Visibility toggle (visible to client by default)
- Clients can view all visible notes in their account dashboard

**Report Upload:**
- Doctors/admins can upload medical reports/documents
- Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX
- File size limit: 20MB
- Reports include:
  - Original filename
  - Description/label (e.g., "Lab Results", "X-ray")
  - Upload timestamp
  - Visibility toggle (visible to client by default)
- Clients can download their reports from account dashboard

**Admin Routes:**
- `GET /api/appointments/:id/notes` - Get all notes for appointment
- `POST /api/appointments/:id/notes` - Add new note
- `DELETE /api/appointments/:id/notes/:noteId` - Delete note
- `GET /api/appointments/:id/reports` - Get all reports
- `POST /api/appointments/:id/reports` - Upload report (multipart/form-data)
- `DELETE /api/appointments/:id/reports/:reportId` - Delete report

**Client Routes:**
- `GET /api/customers/appointments` - Get all appointments with notes and reports

### 3. Navigation Improvements ✅

**Track Order Page:**
- "Track Another Order" button now checks if user is logged in
- If logged in: Redirects to `/account` (My Orders tab)
- If not logged in: Clears current order and shows track form

**Header Menu:**
- "My Account" link already visible in mobile hamburger menu
- Desktop dropdown shows "My Account" and "My Orders" options
- Sign Out option available in both mobile and desktop

### 4. Database Schema Updates ✅

**customers table:**
```sql
- landmark VARCHAR(255) -- Closest landmark
- chronic_conditions TEXT -- Comma-separated conditions
- allergies TEXT -- Known allergies
- profile_completed BOOLEAN -- Mandatory completion flag
```

**orders table:**
```sql
- customer_id INT -- Link to customers table
- handled_by INT -- Admin who processed order
- handled_by_name VARCHAR(255) -- Admin name for display
- payment_method VARCHAR(50) -- mpesa, cash, bank_transfer
- mpesa_receipt VARCHAR(50) -- M-Pesa receipt number
```

**appointments table:**
```sql
- customer_id INT -- Link to customers table
- handled_by INT -- Doctor/admin who handled
- handled_by_name VARCHAR(255) -- Doctor name for display
```

**appointment_notes table (NEW):**
```sql
CREATE TABLE appointment_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  admin_id INT,
  admin_name VARCHAR(255),
  note TEXT NOT NULL,
  is_visible_to_client BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);
```

**appointment_reports table (NEW):**
```sql
CREATE TABLE appointment_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  admin_id INT,
  admin_name VARCHAR(255),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  description VARCHAR(500),
  is_visible_to_client BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);
```

## Files Created/Modified

### New Files:
1. `/frontend/src/pages/CompleteProfile.js` - Profile completion form
2. `/backend/database/profile-enhancements-migration.sql` - Database migration
3. `/run-migration.js` - Migration runner script
4. `/PROFILE_ENHANCEMENTS.md` - This documentation

### Modified Files:
1. `/backend/database/schema.sql` - Updated with new tables and fields
2. `/frontend/src/contexts/CustomerAuthContext.js` - Enhanced profile sync logic
3. `/frontend/src/pages/CustomerAccount.js` - Added appointments tab with notes/reports
4. `/backend/controllers/customerController.js` - Link appointments to customers
5. `/frontend/src/pages/TrackOrder.js` - Fixed navigation (already working correctly)
6. `/frontend/src/components/Header.js` - Header already has account links

## Installation & Deployment

### Step 1: Run Database Migration

```bash
# From project root
node run-migration.js
```

Or manually run the SQL:
```bash
mysql -u [username] -p [database_name] < backend/database/profile-enhancements-migration.sql
```

### Step 2: Restart Backend Server

```bash
cd backend
npm restart
```

Or if using PM2:
```bash
pm2 restart esena-backend
```

### Step 3: Rebuild Frontend (if deployed)

```bash
cd frontend
npm run build
```

### Step 4: Verify Changes

1. **Test Profile Completion:**
   - Sign in with Google or create new account
   - Verify redirect to `/complete-profile`
   - Fill all required fields including health info
   - Verify can't skip the form

2. **Test Appointment Notes (Admin):**
   - Login to admin panel
   - Go to Manage Appointments
   - Click on an appointment
   - Add a consultation note
   - Upload a medical report (PDF/image)

3. **Test Client View:**
   - Login as customer
   - Go to My Account → Appointments tab
   - Verify notes and reports are visible
   - Download a report to test

4. **Test Navigation:**
   - Track an order while logged in
   - Click "Track Another Order"
   - Verify redirects to account orders page (not track form)

## Security Considerations

1. **File Upload Security:**
   - File type validation (whitelist only)
   - File size limit (20MB)
   - Files stored outside web root
   - Unique filenames prevent overwrite

2. **Health Data Privacy:**
   - All health information encrypted in transit (HTTPS)
   - Access controlled via Firebase authentication
   - Only doctors/admins can view full health records
   - Customers can only see their own data

3. **Profile Completion:**
   - Cannot bypass required fields
   - Frontend and backend validation
   - Profile completion flag prevents ordering without details

## API Documentation

### Customer Endpoints

#### Complete Profile
```http
POST /api/customers/auth
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "0712345678",
  "delivery_address": "123 Main St",
  "landmark": "Near Equity Bank",
  "city": "Nairobi",
  "county": "Nairobi",
  "date_of_birth": "1990-01-01",
  "blood_type": "A+",
  "chronic_conditions": "Diabetes, Hypertension",
  "allergies": "Penicillin",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "0723456789",
  "profile_completed": true
}
```

#### Get My Appointments (with notes & reports)
```http
GET /api/customers/appointments
Authorization: Bearer <firebase-token>

Response:
{
  "success": true,
  "appointments": [
    {
      "id": 1,
      "service": "Doctor Consultation",
      "date": "2026-07-10",
      "status": "completed",
      "notes": [
        {
          "id": 1,
          "admin_name": "Dr. Smith",
          "note": "Patient shows improvement...",
          "created_at": "2026-07-10T14:30:00"
        }
      ],
      "reports": [
        {
          "id": 1,
          "file_name": "lab_results.pdf",
          "file_path": "report_appt1_123456.pdf",
          "description": "Blood Test Results",
          "created_at": "2026-07-10T14:45:00"
        }
      ]
    }
  ]
}
```

### Admin Endpoints

#### Add Appointment Note
```http
POST /api/appointments/:id/notes
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "note": "Patient diagnosed with mild hypertension. Prescribed medication and lifestyle changes.",
  "is_visible_to_client": true
}
```

#### Upload Appointment Report
```http
POST /api/appointments/:id/reports
Authorization: Bearer <admin-jwt-token>
Content-Type: multipart/form-data

FormData:
  report: <file>
  description: "Blood Test Results"
  is_visible_to_client: true
```

## Future Enhancements

1. **Medication Reminders:**
   - SMS/Email reminders based on chronic conditions
   - Prescription refill notifications

2. **Health Tracking:**
   - Blood pressure logs
   - Blood sugar logs
   - Medication adherence tracking

3. **Telemedicine:**
   - Video consultation integration
   - Real-time chat with doctors

4. **Advanced Reporting:**
   - Health trends over time
   - Medication history
   - Appointment history analytics

## Support

For issues or questions:
- Email: esenapharmacy@gmail.com
- Phone: 0768103599
- Location: Outering Road, Behind Eastmart Supermarket, Ruaraka, Nairobi

---

**Date:** July 3, 2026  
**Version:** 2.0.0  
**Status:** ✅ Complete
