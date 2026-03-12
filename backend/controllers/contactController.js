const db = require("../config/db");
const { sendEmail } = require("../config/mail");
const { recaptchaMiddleware } = require("../utils/recaptcha");

// Validation helper
const validateContactData = (data) => {
  const errors = [];
  
  // Validate name (Requirement 16.4)
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required");
  } else if (data.name.length > 255) {
    errors.push("Name must not exceed 255 characters");
  }
  
  // Validate email (Requirement 16.5)
  if (!data.email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }
  
  // Validate phone (Requirement 16.5)
  if (!data.phone) {
    errors.push("Phone is required");
  } else if (data.phone.length < 10 || data.phone.length > 20) {
    errors.push("Phone must be between 10 and 20 characters");
  }
  
  // Validate message (Requirement 16.5)
  if (!data.message || data.message.trim().length === 0) {
    errors.push("Message is required");
  }
  
  return errors;
};

const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate contact data (Requirements 16.4, 16.5)
    const validationErrors = validateContactData({ name, email, phone, message });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }
    
    // Insert contact message into database (Requirement 16.5)
    await db.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
      [name, email, phone, message]
    );
    
    // Send notification email to admin (Requirement 16.6)
    let emailWarning = false;
    
    try {
      // Send notification to admin
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: `New Contact Message from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p><em>Please respond to this inquiry promptly.</em></p>
        `
      });
      
      // Send confirmation email to customer
      await sendEmail({
        to: email,
        subject: "Thank you for contacting Esena Pharmacy",
        html: `
          <h2>Thank you for your message, ${name}!</h2>
          <p>We have received your inquiry and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #28a745; margin: 10px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>Our team typically responds within 24 hours during business days.</p>
          <p>Thank you for choosing Esena Pharmacy!</p>
        `
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      emailWarning = true;
    }
    
    res.status(201).json({ 
      message: "Message sent successfully",
      warning: emailWarning ? "Email notification failed" : undefined
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createContact
};
