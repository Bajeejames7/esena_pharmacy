const db = require("../config/db");
const { 
  sendEmail, 
  appointmentConfirmationTemplate, 
  appointmentAdminNotificationTemplate,
  appointmentConfirmationUpdateTemplate,
  appointmentCompletionTemplate
} = require("../config/mail");
const { generateUniqueToken } = require("../utils/tokenGenerator");

// Valid appointment services
const VALID_SERVICES = ['Dermatology', 'LabTest', 'Pharmacist'];

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
    
    // Insert appointment into database (Requirement 8.9)
    const [result] = await db.query(
      "INSERT INTO appointments (name, email, phone, service, date, message, token, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')",
      [name, email, phone, service, date, message || null, token]
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

exports.getAllAppointments = async (req, res) => {
  try {
    const [appointments] = await db.query("SELECT * FROM appointments ORDER BY date DESC");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update appointment status with email notifications (Requirements 9.5, 9.6, 9.7)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'completed'];
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
    await db.query("UPDATE appointments SET status = ? WHERE id = ?", [status, id]);
    
    // Send email notification for status changes (Requirements 9.6, 9.7)
    let emailWarning = false;
    
    try {
      if (status === 'confirmed') {
        // Send confirmation update email (Requirement 9.6)
        const template = appointmentConfirmationUpdateTemplate(appointment);
        const emailSent = await sendEmail({
          to: appointment.email,
          subject: template.subject,
          html: template.html
        });
        emailWarning = !emailSent;
      } else if (status === 'completed') {
        // Send completion notification email (Requirement 9.7)
        const template = appointmentCompletionTemplate(appointment);
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
