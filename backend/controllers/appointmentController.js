const db = require("../config/db");
const { 
  sendEmail, 
  appointmentConfirmationTemplate, 
  appointmentAdminNotificationTemplate,
  appointmentConfirmationUpdateTemplate,
  appointmentCompletionTemplate,
  appointmentCancellationTemplate,
  appointmentRescheduleTemplate
} = require("../config/mail");
const { generateUniqueToken } = require("../utils/tokenGenerator");
const { logActivity } = require("../utils/activityLog");

// Valid appointment services
const VALID_SERVICES = [
  'Doctor Consultation',
  'Pharmacist Consultation',
  'Online Consultation',
  'Dermatology',
  'Nutrition and Wellness',
  'Eye Care',
  'Laboratory Tests',
  'Blood Tests',
  'Malaria Testing',
  'HIV Testing Support',
  'Cholesterol Testing',
  'Vaccinations',
  'Family Planning',
  'Full Health Screening',
  'Blood Pressure Check',
  'Blood Glucose Testing',
  'BMI Measurement',
  'Diabetes Management',
  'Heart Health Consultation',
  'Weight Management',
  'Ear Piercing',
  // Legacy values for backward compatibility with existing records
  'LabTest',
  'Pharmacist',
];

// Validation helper
const validateAppointmentData = (data) => {
  const errors = [];
  
  // Validate name (Requirement 8.6)
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required");
  } else if (data.name.length > 255) {
    errors.push("Name must not exceed 255 characters");
  }
  
  // Validate email (Requirement 8.7)
  if (!data.email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }
  
  // Validate phone (Requirement 8.7)
  if (!data.phone) {
    errors.push("Phone is required");
  } else if (data.phone.length < 10 || data.phone.length > 20) {
    errors.push("Phone must be between 10 and 20 characters");
  }
  
  // Validate service (Requirement 8.8)
  if (!data.service) {
    errors.push("Service is required");
  } else if (!VALID_SERVICES.includes(data.service)) {
    errors.push(`Service must be one of: ${VALID_SERVICES.join(', ')}`);
  }
  
  // Validate date (Requirement 8.9)
  if (!data.date) {
    errors.push("Date is required");
  } else {
    const appointmentDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (isNaN(appointmentDate.getTime())) {
      errors.push("Invalid date format");
    } else if (appointmentDate <= today) {
      errors.push("Appointment date must be in the future");
    }
  }
  
  return errors;
};

exports.createAppointment = async (req, res) => {
  try {
    const { name, email, phone, service, date, message } = req.body;
    
    // Validate appointment data (Requirements 8.6, 8.7, 8.8, 8.9)
    const validationErrors = validateAppointmentData({ name, email, phone, service, date });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }
    
    // Generate unique token for appointment tracking (Requirement 8.9)
    const token = await generateUniqueToken();

    // Extract time from date string if present (e.g. "2026-03-25T09:00:00")
    let timeValue = null;
    if (date && date.includes('T')) {
      const timePart = date.split('T')[1];
      timeValue = timePart ? timePart.substring(0, 5) : null; // "09:00"
    }
    
    // Insert appointment into database (Requirement 8.9)
    const [result] = await db.query(
      "INSERT INTO appointments (name, email, phone, service, date, time, message, token, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
      [name, email, phone, service, date, timeValue, message || null, token]
    );
    
    // Send email notifications (Requirements 8.10, 8.11)
    let emailWarning = false;
    
    try {
      // Prepare appointment object for email templates
      const appointmentForEmail = {
        name,
        email,
        phone,
        service,
        date,
        message,
        token
      };
      
      // Send confirmation email to customer (Requirement 8.10)
      const customerTemplate = appointmentConfirmationTemplate(appointmentForEmail);
      const customerEmailSent = await sendEmail({
        to: email,
        subject: customerTemplate.subject,
        html: customerTemplate.html
      });
      
      // Send notification email to admin (Requirement 8.11)
      const adminTemplate = appointmentAdminNotificationTemplate(appointmentForEmail);
      const adminEmailSent = await sendEmail({
        to: process.env.EMAIL_USER,
        subject: adminTemplate.subject,
        html: adminTemplate.html
      });
      
      // Set warning if either email failed
      emailWarning = !customerEmailSent || !adminEmailSent;
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      emailWarning = true;
    }
    
    res.status(201).json({ 
      id: result.insertId, 
      token, 
      message: "Appointment booked successfully",
      warning: emailWarning ? "Email notification failed" : undefined
    });
  } catch (error) {
    console.error("Appointment creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get appointment details by tracking token (Requirements 9.1, 9.2, 9.3, 9.4)
exports.getAppointmentByToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Query database for appointment with matching token (Requirement 9.2)
    const [appointments] = await db.query("SELECT * FROM appointments WHERE token = ?", [token]);
    
    // Return 404 if not found (Requirement 9.4)
    if (appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Return appointment details (Requirement 9.3)
    res.json(appointments[0]);
  } catch (error) {
    console.error("Appointment tracking error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get booked time slots for a given date (public — used by booking form)
exports.getAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date query param required" });

    // Match any appointment on that date that isn't cancelled
    const [rows] = await db.query(
      "SELECT time FROM appointments WHERE DATE(date) = ? AND status != 'cancelled' AND time IS NOT NULL",
      [date]
    );

    const bookedTimes = rows.map(r => r.time);
    res.json({ bookedTimes });
  } catch (error) {
    console.error("Availability check error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    // Extract query parameters
    const limit = parseInt(req.query.limit) || null;
    const sort = req.query.sort || 'created_at';
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
    
    // Validate sort field to prevent SQL injection
    const validSortFields = ['created_at', 'date', 'status', 'customer_name'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    
    // Build query
    let query = `SELECT * FROM appointments ORDER BY ${sortField} ${order}`;
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    const [appointments] = await db.query(query);
    
    // Return in the format expected by the frontend
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update appointment status with email notifications (Requirements 9.5, 9.6, 9.7)
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date) {
      return res.status(400).json({ message: "New date is required" });
    }

    const [appointments] = await db.query("SELECT * FROM appointments WHERE id = ?", [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = appointments[0];

    // Build the new datetime string
    const newDate = time ? `${date}T${time}:00` : date;

    await db.query("UPDATE appointments SET date = ?, status = 'confirmed' WHERE id = ?", [newDate, id]);

    await logActivity({
      userId: req.user?.userId,
      userName: req.user?.username,
      action: 'APPOINTMENT_RESCHEDULED',
      resourceType: 'appointment',
      resourceId: parseInt(id),
      description: `Rescheduled to ${newDate}`,
      oldValue: { date: appointment.date },
      newValue: { date: newDate },
      ip: req.ip
    });

    // Send reschedule email to customer
    let emailWarning = false;
    try {
      const updatedAppointment = { ...appointment, date: newDate, time: time || appointment.time };
      const template = appointmentRescheduleTemplate(updatedAppointment);
      const sent = await sendEmail({ to: appointment.email, subject: template.subject, html: template.html });
      emailWarning = !sent;
    } catch (emailError) {
      console.error("Reschedule email failed:", emailError);
      emailWarning = true;
    }

    res.json({
      message: "Appointment rescheduled successfully",
      warning: emailWarning ? "Email notification failed" : undefined
    });
  } catch (error) {
    console.error("Reschedule error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update appointment status with email notifications (Requirements 9.5, 9.6, 9.7)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Get current appointment
    const [appointments] = await db.query("SELECT * FROM appointments WHERE id = ?", [id]);
    
    if (appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    const appointment = appointments[0];
    
    // Update appointment status (Requirement 9.5)
    await db.query("UPDATE appointments SET status = ?, handled_by = ?, handled_by_name = ? WHERE id = ?",
      [status, req.user?.userId || null, req.user?.username || null, id]);

    await logActivity({
      userId: req.user?.userId,
      userName: req.user?.username,
      action: 'APPOINTMENT_STATUS_UPDATED',
      resourceType: 'appointment',
      resourceId: parseInt(id),
      description: `Status changed to ${status}`,
      oldValue: { status: appointment.status },
      newValue: { status },
      ip: req.ip
    });
    
    // Send email notification for status changes (Requirements 9.6, 9.7)
    let emailWarning = false;
    
    try {
      if (status === 'confirmed') {
        const template = appointmentConfirmationUpdateTemplate(appointment);
        const emailSent = await sendEmail({
          to: appointment.email,
          subject: template.subject,
          html: template.html
        });
        emailWarning = !emailSent;
      } else if (status === 'completed') {
        const template = appointmentCompletionTemplate(appointment);
        const emailSent = await sendEmail({
          to: appointment.email,
          subject: template.subject,
          html: template.html
        });
        emailWarning = !emailSent;
      } else if (status === 'cancelled') {
        const template = appointmentCancellationTemplate(appointment);
        const emailSent = await sendEmail({
          to: appointment.email,
          subject: template.subject,
          html: template.html
        });
        emailWarning = !emailSent;
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      emailWarning = true;
    }
    
    res.json({ 
      message: "Appointment status updated successfully",
      warning: emailWarning ? "Email notification failed" : undefined
    });
  } catch (error) {
    console.error("Appointment status update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
