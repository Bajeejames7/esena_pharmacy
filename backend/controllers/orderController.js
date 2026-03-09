const db = require("../config/db");
const { 
  sendEmail, 
  orderConfirmationTemplate, 
  orderAdminNotificationTemplate,
  paymentRequestTemplate,
  dispatchNotificationTemplate
} = require("../config/mail");
const { generateUniqueToken } = require("../utils/tokenGenerator");

/**
 * Create a new order with validation and transaction handling
 * Implements Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 14.1, 14.2, 14.3, 14.9, 14.10
 */
exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { customer_name, email, phone, delivery_address, notes, items } = req.body;
    
    // Validate required fields (Req 5.2, 5.3)
    if (!customer_name || !email || !phone || !delivery_address) {
      return res.status(400).json({ 
        message: "Missing required fields",
        errors: {
          customer_name: !customer_name ? "Customer name is required" : undefined,
          email: !email ? "Email is required" : undefined,
          phone: !phone ? "Phone is required" : undefined,
          delivery_address: !delivery_address ? "Delivery address is required" : undefined
        }
      });
    }
    
    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    
    // Validate each item
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price) {
        return res.status(400).json({ 
          message: "Invalid cart item: missing product_id, quantity, or price" 
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({ 
          message: "Invalid cart item: quantity must be positive" 
        });
      }
      if (item.price < 0) {
        return res.status(400).json({ 
          message: "Invalid cart item: price cannot be negative" 
        });
      }
    }
    
    // Calculate order total from cart items (Req 5.4)
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate unique token for order tracking (Req 5.5)
    const token = await generateUniqueToken();
    
    // Start transaction (Req 5.6)
    await connection.beginTransaction();
    
    // Insert order into database (Req 5.6)
    const [orderResult] = await connection.query(
      "INSERT INTO orders (customer_name, email, phone, delivery_address, notes, total, token, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')",
      [customer_name, email, phone, delivery_address, notes, total, token]
    );
    
    const orderId = orderResult.insertId;
    
    // Insert order items in database transaction (Req 5.7)
    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    
    // Commit transaction
    await connection.commit();
    
    // Get order items with product names for email
    const [orderItems] = await connection.query(
      "SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?",
      [orderId]
    );
    
    // Prepare order object for email templates
    const orderForEmail = {
      customer_name,
      email,
      phone,
      delivery_address,
      notes,
      total,
      token
    };
    
    // Send emails (Req 5.8, 5.9, 14.1, 14.2, 14.3, 14.9, 14.10)
    let emailWarning = false;
    
    try {
      // Send confirmation email to customer (Req 5.8, 14.1, 14.2)
      const customerTemplate = orderConfirmationTemplate(orderForEmail, orderItems);
      const customerEmailSent = await sendEmail({
        to: email,
        subject: customerTemplate.subject,
        html: customerTemplate.html
      });
      
      // Send notification email to admin (Req 5.9, 14.3)
      const adminTemplate = orderAdminNotificationTemplate(orderForEmail, orderItems);
      const adminEmailSent = await sendEmail({
        to: process.env.EMAIL_USER,
        subject: adminTemplate.subject,
        html: adminTemplate.html
      });
      
      // Set warning if either email failed (Req 14.10)
      emailWarning = !customerEmailSent || !adminEmailSent;
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      emailWarning = true;
    }
    
    // Return success response (Req 5.10)
    res.status(201).json({ 
      orderId, 
      token, 
      message: "Order created successfully",
      warning: emailWarning ? "Email notification failed" : undefined
    });
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Get order details by tracking token
 * Implements Requirements 6.1, 6.2, 6.3, 6.4
 */
exports.getOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Query database for order with matching token (Req 6.2)
    const [orders] = await db.query("SELECT * FROM orders WHERE token = ?", [token]);
    
    // Return 404 if not found (Req 6.4)
    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Get order items with product details (Req 6.3)
    const [items] = await db.query(
      "SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?",
      [orders[0].id]
    );
    
    // Return order details with items (Req 6.3)
    res.json({ ...orders[0], items });
  } catch (error) {
    console.error("Order tracking error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update order status with workflow validation and email notifications
 * Implements Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 14.7, 14.8, 14.9, 14.10
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    // Validate status value
    const validStatuses = ['pending', 'payment_requested', 'paid', 'dispatched', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Get current order status
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const currentStatus = orders[0].status;
    const order = orders[0];
    
    // Validate status transition follows workflow rules (Req 7.1, 7.2, 7.3, 7.4, 7.5)
    const validTransitions = {
      'pending': ['payment_requested', 'completed'],
      'payment_requested': ['paid', 'completed'],
      'paid': ['dispatched', 'completed'],
      'dispatched': ['completed'],
      'completed': []
    };
    
    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from '${currentStatus}' to '${status}'. Valid transitions: ${validTransitions[currentStatus].join(', ') || 'none'}` 
      });
    }
    
    // Update order status (Req 7.1)
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    
    // Send email notifications based on status change (Req 7.7, 7.8, 7.9, 14.7, 14.8, 14.9, 14.10)
    let emailWarning = false;
    
    try {
      if (status === 'payment_requested') {
        // Send payment request email (Req 7.7, 14.7)
        const template = paymentRequestTemplate(order);
        const emailSent = await sendEmail({
          to: order.email,
          subject: template.subject,
          html: template.html
        });
        emailWarning = !emailSent;
      } else if (status === 'dispatched') {
        // Send dispatch notification email (Req 7.8, 14.8)
        const template = dispatchNotificationTemplate(order);
        const emailSent = await sendEmail({
          to: order.email,
          subject: template.subject,
          html: template.html
        });
        emailWarning = !emailSent;
      } else if (status === 'completed') {
        // Send completion confirmation email (Req 7.9)
        const emailSent = await sendEmail({
          to: order.email,
          subject: "Order Completed - Esena Pharmacy",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #27ae60; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✓ Order Completed</h1>
                </div>
                <div class="content">
                  <p>Dear ${order.customer_name},</p>
                  <p>Your order has been successfully completed. Thank you for shopping with us!</p>
                  <p><strong>Order Token:</strong> ${order.token}</p>
                  <p>We hope to serve you again soon.</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
        emailWarning = !emailSent;
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      emailWarning = true;
    }
    
    res.json({ 
      message: "Order status updated successfully",
      warning: emailWarning ? "Email notification failed" : undefined
    });
  } catch (error) {
    console.error("Order status update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
