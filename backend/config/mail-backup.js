const nodemailer = require("nodemailer");

/**
 * Email transporter configuration with SMTP settings
 * Implements Requirements 14.9, 14.10
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Connection timeout and retry settings
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
});

/**
 * Verify transporter configuration on startup
 * Logs error but doesn't crash the application (Req 14.9)
 */
if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error, success) => {
    if (error) {
      console.error("Email transporter configuration error:", error.message);
      console.error("Email notifications will not be sent. Please check your SMTP settings.");
    } else {
      console.log("Email server is ready to send messages");
    }
  });
}

/**
 * Email template for order confirmation to customer
 * Implements Requirements 5.8, 14.1, 14.2
 */
const orderConfirmationTemplate = (order, items = []) => {
  const itemsList = items.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name || 'Product'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KSH ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');
  
  return {
    subject: "Order Confirmation - Esena Pharmacy",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .token-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          .order-items { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .items-table { width: 100%; border-collapse: collapse; }
          .items-table th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; background: #f8f9fa; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Order!</h1>
          </div>
          <div class="content">
            <p>Dear ${order.customer_name},</p>
            <p>Your order has been received and is being processed. We'll keep you updated on its progress.</p>
            
            <div class="token-box">
              <strong>Order Tracking Token:</strong><br>
              <code style="font-size: 16px; color: #667eea;">${order.token}</code>
            </div>
            
            ${items.length > 0 ? `
            <div class="order-items">
              <h3 style="margin-top: 0; color: #333;">📦 Your Order Items:</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                  <tr class="total-row">
                    <td colspan="2" style="text-align: right; padding: 15px;">Total:</td>
                    <td style="text-align: right; padding: 15px;">KSH ${order.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            ` : `<p><strong>Order Total:</strong> KSH ${order.total.toFixed(2)}</p>`}
            
            <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
            
            <a href="${process.env.FRONTEND_URL}/track/${order.token}" class="button">Track Your Order</a>
            
            <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:esenapharmacy@gmail.com">esenapharmacy@gmail.com</a> or call 0768103599.</p>
          </div>
          <div class="footer">
            <p>Esena Pharmacy - Your Trusted Healthcare Partner</p>
            <p>Behind Eastmatt Supermarket, Ruaraka, Nairobi</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

/**
 * Email template for order notification to admin
 * Implements Requirements 5.9, 14.3
 */
const orderAdminNotificationTemplate = (order, items) => {
  const itemsList = items.map(item => 
    `<li>${item.name || 'Product'} - Qty: ${item.quantity} - KSH ${(item.price * item.quantity).toFixed(2)}</li>`
  ).join('');
  
  return {
    subject: `🛒 New Order #${order.token} from ${order.customer_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { width: 60px; height: 60px; margin: 0 auto 15px; background: white; border-radius: 8px; padding: 8px; }
          .logo img { width: 100%; height: 100%; object-fit: contain; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #2c3e50; }
          .urgent { background: #e74c3c; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🛒 New Order Received</h2>
          </div>
          <div class="content">
            <div class="urgent">
              <strong>⚡ ACTION REQUIRED: New order needs processing</strong>
            </div>
            
            <div class="info-row"><span class="label">Order Token:</span> ${order.token}</div>
            <div class="info-row"><span class="label">Customer:</span> ${order.customer_name}</div>
            <div class="info-row"><span class="label">Email:</span> ${order.email}</div>
            <div class="info-row"><span class="label">Phone:</span> ${order.phone}</div>
            <div class="info-row"><span class="label">Delivery Address:</span> ${order.delivery_address}</div>
            <div class="info-row"><span class="label">Total:</span> <strong>KSH ${order.total.toFixed(2)}</strong></div>
            ${order.notes ? `<div class="info-row"><span class="label">Notes:</span> ${order.notes}</div>` : ''}
            
            <h3>📦 Order Items:</h3>
            <ul>${itemsList}</ul>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Verify product availability</li>
              <li>Contact customer if needed: ${order.phone}</li>
              <li>Process payment if required</li>
              <li>Prepare order for dispatch</li>
            </ol>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

/**
 * Email template for payment request
 * Implements Requirements 7.7, 14.7
 */
const paymentRequestTemplate = (order) => {
  return {
    subject: "Payment Request - Esena Pharmacy",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f39c12; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount-box { background: white; padding: 20px; text-align: center; border: 2px solid #f39c12; margin: 20px 0; border-radius: 5px; }
          .amount { font-size: 32px; color: #f39c12; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Request</h1>
          </div>
          <div class="content">
            <p>Dear ${order.customer_name},</p>
            <p>Your order is ready for payment. Please complete the payment to proceed with your order.</p>
            
            <div class="amount-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Amount Due</p>
              <div class="amount">KSH ${order.total.toFixed(2)}</div>
            </div>
            
            <p><strong>Order Token:</strong> ${order.token}</p>
            <p><strong>Payment Instructions:</strong></p>
            <ol>
              <li>Go to M-PESA on your phone</li>
              <li>Select Lipa Na M-PESA</li>
              <li>Select Pay Bill</li>
              <li>Enter Business Number: [TO BE CONFIGURED]</li>
              <li>Enter Account Number: ${order.token}</li>
              <li>Enter Amount: ${order.total.toFixed(2)}</li>
              <li>Enter your M-PESA PIN and confirm</li>
            </ol>
            
            <p>Once payment is confirmed, we'll process your order immediately.</p>
            <p>For assistance, contact us at <a href="mailto:esenapharmacy@gmail.com">esenapharmacy@gmail.com</a> or call 0768103599.</p>
          </div>
          <div class="footer">
            <p>Esena Pharmacy - Your Trusted Healthcare Partner</p>
            <p>Behind Eastmatt Supermarket, Ruaraka, Nairobi</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

/**
 * Email template for dispatch notification
 * Implements Requirements 7.8, 14.8
 */
const dispatchNotificationTemplate = (order) => {
  return {
    subject: "Order Dispatched - Esena Pharmacy",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order Has Been Dispatched!</h1>
          </div>
          <div class="content">
            <p>Dear ${order.customer_name},</p>
            <p>Great news! Your order has been dispatched and is on its way to you.</p>
            
            <p><strong>Order Token:</strong> ${order.token}</p>
            <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
            
            <a href="${process.env.FRONTEND_URL}/track/${order.token}" class="button">Track Your Order</a>
            
            <p>You should receive your order soon. If you have any questions, please contact us at <a href="mailto:esenapharmacy@gmail.com">esenapharmacy@gmail.com</a> or call 0768103599.</p>
          </div>
          <div class="footer">
            <p>Esena Pharmacy - Your Trusted Healthcare Partner</p>
            <p>Behind Eastmatt Supermarket, Ruaraka, Nairobi</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

/**
 * Email template for appointment confirmation to customer
 * Implements Requirements 8.10, 14.4, 14.5
 */
const appointmentConfirmationTemplate = (appointment) => {
  return {
    subject: "Appointment Confirmation - Esena Pharmacy",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Confirmed</h1>
          </div>
          <div class="content">
            <p>Dear ${appointment.name},</p>
            <p>Your appointment has been scheduled successfully.</p>
            
            <div class="appointment-box">
              <p><strong>Service:</strong> ${appointment.service}</p>
              <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleString()}</p>
              <p><strong>Tracking Token:</strong><br>
              <code style="font-size: 16px; color: #667eea;">${appointment.token}</code></p>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/track-appointment/${appointment.token}" class="button">View Appointment Details</a>
            
            <p>Please arrive 10 minutes before your scheduled time. If you need to reschedule, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

/**
 * Email template for appointment notification to admin
 * Implements Requirements 8.11, 14.6
 */
const appointmentAdminNotificationTemplate = (appointment) => {
  return {
    subject: `📅 New Appointment: ${appointment.service} - ${appointment.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { width: 60px; height: 60px; margin: 0 auto 15px; background: white; border-radius: 8px; padding: 8px; }
          .logo img { width: 100%; height: 100%; object-fit: contain; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #2c3e50; }
          .urgent { background: #e74c3c; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📅 New Appointment Scheduled</h2>
          </div>
          <div class="content">
            <div class="urgent">
              <strong>⚡ ACTION REQUIRED: New appointment needs confirmation</strong>
            </div>
            
            <div class="info-row"><span class="label">Patient:</span> ${appointment.name}</div>
            <div class="info-row"><span class="label">Email:</span> ${appointment.email}</div>
            <div class="info-row"><span class="label">Phone:</span> ${appointment.phone}</div>
            <div class="info-row"><span class="label">Service:</span> ${appointment.service}</div>
            <div class="info-row"><span class="label">Date:</span> ${new Date(appointment.date).toLocaleString()}</div>
            <div class="info-row"><span class="label">Token:</span> ${appointment.token}</div>
            ${appointment.message ? `<div class="info-row"><span class="label">Message:</span> ${appointment.message}</div>` : ''}
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Review appointment details</li>
              <li>Contact patient to confirm: ${appointment.phone}</li>
              <li>Schedule appropriate time slot</li>
              <li>Update appointment status in admin panel</li>
            </ol>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

/**
 * Send email with error handling
 * Implements Requirements 14.9, 14.10
 * @param {Object} mailOptions - Email options (to, subject, html)
 * @returns {Promise<boolean>} - Returns true if sent successfully, false otherwise
 */
const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Esena Pharmacy" <${process.env.EMAIL_USER}>`,
      ...mailOptions
    });
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    // Log error but don't throw - allows order/appointment creation to succeed (Req 14.9)
    return false;
  }
};

/**
 * Email template for appointment confirmation update to customer
 * Implements Requirements 9.6, 14.4, 14.5
 */
const appointmentConfirmationUpdateTemplate = (appointment) => {
  return {
    subject: "Appointment Confirmed - Esena Pharmacy",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-box { background: white; padding: 20px; border-left: 4px solid #27ae60; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Appointment Confirmed</h1>
          </div>
          <div class="content">
            <p>Dear ${appointment.name},</p>
            <p>We are pleased to confirm your appointment:</p>
            
            <div class="appointment-box">
              <p><strong>Service:</strong> ${appointment.service}</p>
              <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleString()}</p>
              <p><strong>Tracking Token:</strong><br>
              <code style="font-size: 16px; color: #27ae60;">${appointment.token}</code></p>
            </div>
            
            <p>Please arrive 15 minutes early for your appointment.</p>
            <p>If you need to reschedule, please contact us as soon as possible at <a href="mailto:esenapharmacy@gmail.com">esenapharmacy@gmail.com</a> or call 0768103599.</p>
          </div>
          <div class="footer">
            <p>Esena Pharmacy - Your Trusted Healthcare Partner</p>
            <p>Behind Eastmatt Supermarket, Ruaraka, Nairobi</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

/**
 * Email template for appointment completion notification to customer
 * Implements Requirements 9.7, 14.4, 14.5
 */
const appointmentCompletionTemplate = (appointment) => {
  return {
    subject: "Appointment Completed - Esena Pharmacy",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Thank You for Your Visit</h1>
          </div>
          <div class="content">
            <p>Dear ${appointment.name},</p>
            <p>Your appointment has been completed successfully.</p>
            
            <div class="appointment-box">
              <p><strong>Service:</strong> ${appointment.service}</p>
              <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleString()}</p>
              <p><strong>Tracking Token:</strong> ${appointment.token}</p>
            </div>
            
            <p>We hope you had a positive experience with our services.</p>
            <p>If you have any questions or need follow-up care, please don't hesitate to contact us at <a href="mailto:esenapharmacy@gmail.com">esenapharmacy@gmail.com</a> or call 0768103599.</p>
          </div>
          <div class="footer">
            <p>Esena Pharmacy - Your Trusted Healthcare Partner</p>
            <p>Behind Eastmatt Supermarket, Ruaraka, Nairobi</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

module.exports = {
  transporter,
  sendEmail,
  orderConfirmationTemplate,
  orderAdminNotificationTemplate,
  paymentRequestTemplate,
  dispatchNotificationTemplate,
  appointmentConfirmationTemplate,
  appointmentAdminNotificationTemplate,
  appointmentConfirmationUpdateTemplate,
  appointmentCompletionTemplate
};
