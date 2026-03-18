const db = require("../config/db");
const { 
  sendEmail, 
  orderConfirmationTemplate, 
  orderAdminNotificationTemplate,
  paymentRequestTemplate,
  dispatchNotificationTemplate,
  paymentConfirmedTemplate,
  readyForPickupTemplate
} = require("../config/mail");
const { generateUniqueToken } = require("../utils/tokenGenerator");

/**
 * Cancel an order - restores stock, sends cancellation email
 * Can be called by customer (via token) or admin (via id + auth)
 */
// Shared helper: build cancellation emails
const buildCancellationEmails = (order, reason, cancelledByAdmin) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://esena.co.ke';
  const shopUrl = `${frontendUrl}/shop`;

  const customerHtml = `
    <!DOCTYPE html><html><head><style>
      body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background:#e74c3c;color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}
      .content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}
      .button{display:inline-block;background:#667eea;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0}
      .notice{background:#fff3cd;border-left:4px solid #ffc107;padding:12px 16px;margin:16px 0;font-size:13px}
      .footer{text-align:center;margin-top:20px;color:#666;font-size:12px}
    </style></head><body>
    <div class="container">
      <div class="header"><h1>❌ Order Cancelled</h1></div>
      <div class="content">
        <p>Dear ${order.customer_name},</p>
        <p>Your order <strong>#${order.id}</strong> has been ${cancelledByAdmin ? 'cancelled by our team' : 'cancelled as requested'}.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Your items have been restocked and are available for purchase again.</p>
        <p>Whenever you're ready, you're welcome to shop with us again — we'd love to serve you!</p>
        <a href="${shopUrl}" class="button">Resume Shopping</a>
        <div class="notice">
          🔒 <strong>Privacy reminder:</strong> Your order tracking token is personal. Please keep it secure and do not share it with anyone.
        </div>
        <p>For assistance, contact us at <a href="mailto:esenapharmacy@gmail.com">esenapharmacy@gmail.com</a> or call 0768103599.</p>
      </div>
      <div class="footer"><p>Esena Pharmacy - Your Trusted Healthcare Partner</p><p>OUTERING ROAD BEHIND EASTMART SUPERMARKET RUARAKA, NAIROBI</p></div>
    </div></body></html>`;

  const adminHtml = `
    <!DOCTYPE html><html><head><style>
      body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background:#2c3e50;color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0}
      .content{background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px}
      .label{font-weight:bold;color:#2c3e50}
      .info-row{margin:8px 0}
      .badge{background:#e74c3c;color:white;padding:4px 10px;border-radius:4px;font-size:13px}
    </style></head><body>
    <div class="container">
      <div class="header"><h2>🚫 Order Cancelled</h2></div>
      <div class="content">
        <p><span class="badge">CANCELLED</span></p>
        <div class="info-row"><span class="label">Order ID:</span> #${order.id}</div>
        <div class="info-row"><span class="label">Token:</span> ${order.token}</div>
        <div class="info-row"><span class="label">Customer:</span> ${order.customer_name}</div>
        <div class="info-row"><span class="label">Email:</span> ${order.email}</div>
        <div class="info-row"><span class="label">Phone:</span> ${order.phone}</div>
        <div class="info-row"><span class="label">Total:</span> KSH ${parseFloat(order.total).toFixed(2)}</div>
        <div class="info-row"><span class="label">Cancelled by:</span> ${cancelledByAdmin ? 'Admin' : 'Customer'}</div>
        ${reason ? `<div class="info-row"><span class="label">Reason:</span> ${reason}</div>` : ''}
        <p style="margin-top:16px;color:#666;font-size:13px">Stock has been automatically restored for all items in this order.</p>
      </div>
    </div></body></html>`;

  return { customerHtml, adminHtml };
};

exports.cancelOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const [orders] = await connection.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });

    const order = orders[0];
    if (!['pending', 'payment_requested'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel an order with status '${order.status}'.` });
    }

    await connection.beginTransaction();
    const [items] = await connection.query("SELECT * FROM order_items WHERE order_id = ?", [id]);
    for (const item of items) {
      await connection.query("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
    }
    await connection.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [id]);
    await connection.commit();

    const { customerHtml, adminHtml } = buildCancellationEmails(order, reason, true);
    try {
      await sendEmail({ to: order.email, subject: "Your Order Has Been Cancelled - Esena Pharmacy", html: customerHtml });
      await sendEmail({ to: process.env.EMAIL_USER, subject: `🚫 Order #${order.id} Cancelled by Admin`, html: adminHtml });
    } catch (emailError) {
      console.error("Cancellation email failed:", emailError);
    }

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

exports.cancelOrderByToken = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { token } = req.params;
    const { reason } = req.body;

    const [orders] = await connection.query("SELECT * FROM orders WHERE token = ?", [token]);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });

    const order = orders[0];
    if (!['pending', 'payment_requested'].includes(order.status)) {
      return res.status(400).json({ message: "This order cannot be cancelled. Only pending or payment_requested orders can be cancelled." });
    }

    await connection.beginTransaction();
    const [items] = await connection.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    for (const item of items) {
      await connection.query("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
    }
    await connection.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [order.id]);
    await connection.commit();

    const { customerHtml, adminHtml } = buildCancellationEmails(order, reason || 'Cancelled by customer', false);
    try {
      await sendEmail({ to: order.email, subject: "Your Order Has Been Cancelled - Esena Pharmacy", html: customerHtml });
      await sendEmail({ to: process.env.EMAIL_USER, subject: `🚫 Order #${order.id} Cancelled by Customer`, html: adminHtml });
    } catch (emailError) {
      console.error("Cancellation email failed:", emailError);
    }

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Cancel order by token error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { customer_name, email, phone, delivery_address, notes, delivery_type, delivery_zone, shipping_cost, items } = req.body;
    
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
    
    // Calculate subtotal from cart items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const resolvedShipping = parseFloat(shipping_cost) || 0;
    const total = subtotal + resolvedShipping;
    const resolvedZone = delivery_zone || (delivery_type === 'pickup' ? 'pickup' : 'nairobi');
    
    // Generate unique token for order tracking (Req 5.5)
    const token = await generateUniqueToken();
    
    // Start transaction (Req 5.6)
    await connection.beginTransaction();
    
    // Insert order into database (Req 5.6)
    const [orderResult] = await connection.query(
      "INSERT INTO orders (customer_name, email, phone, delivery_address, notes, delivery_type, delivery_zone, shipping_cost, total, token, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
      [customer_name, email, phone, delivery_address, notes, delivery_type || 'delivery', resolvedZone, resolvedShipping, total, token]
    );
    
    const orderId = orderResult.insertId;
    
    // Insert order items and decrement stock in database transaction (Req 5.7)
    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
      // Decrement product stock
      await connection.query(
        "UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?",
        [item.quantity, item.product_id]
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
      delivery_type: delivery_type || 'delivery',
      delivery_zone: resolvedZone,
      shipping_cost: resolvedShipping,
      subtotal,
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

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    const [items] = await db.query(
      "SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?",
      [id]
    );
    res.json({ ...orders[0], items });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    // Extract query parameters
    const limit = parseInt(req.query.limit) || null;
    const sort = req.query.sort || 'created_at';
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
    
    // Validate sort field to prevent SQL injection
    const validSortFields = ['created_at', 'total', 'status', 'customer_name'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    
    // Build query
    let query = `SELECT * FROM orders ORDER BY ${sortField} ${order}`;
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    const [orders] = await db.query(query);
    
    // Return in the format expected by the frontend
    res.json({ orders });
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
    const validStatuses = ['pending', 'payment_requested', 'paid', 'dispatched', 'ready_for_pickup', 'completed', 'cancelled'];
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
    
    // Validate status transition follows workflow rules
    const validTransitions = {
      'pending': ['payment_requested', 'completed'],
      'payment_requested': ['paid', 'completed'],
      'paid': order.delivery_type === 'pickup' ? ['ready_for_pickup', 'completed'] : ['dispatched', 'completed'],
      'dispatched': ['completed'],
      'ready_for_pickup': ['completed'],
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
      } else if (status === 'paid') {
        // Send payment confirmed email
        const template = paymentConfirmedTemplate(order);
        const emailSent = await sendEmail({
          to: order.email,
          subject: template.subject,
          html: template.html
        });
        emailWarning = !emailSent;
      } else if (status === 'ready_for_pickup') {
        // Send ready for pickup email
        const template = readyForPickupTemplate(order);
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

exports.updateShippingCost = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { shipping_cost } = req.body;

    if (shipping_cost === undefined || isNaN(parseFloat(shipping_cost)) || parseFloat(shipping_cost) < 0) {
      return res.status(400).json({ message: 'Invalid shipping cost' });
    }

    const newShipping = parseFloat(shipping_cost);

    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = orders[0];

    if (['completed', 'cancelled', 'paid', 'dispatched', 'ready_for_pickup'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot update delivery fee for a ${order.status} order.` });
    }
    const [items] = await connection.query(
      'SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [id]
    );

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const newTotal = subtotal + newShipping;

    await connection.query(
      'UPDATE orders SET shipping_cost = ?, total = ? WHERE id = ?',
      [newShipping, newTotal, id]
    );

    // Email customer about updated delivery fee
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'https://esena.co.ke';
      const oldShipping = parseFloat(order.shipping_cost) || 0;

      const itemsRows = items.map(item =>
        `<tr>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;">${item.name || 'Product'}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;">KSH ${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
        </tr>`
      ).join('');

      const html = `<!DOCTYPE html><html><head><style>
        body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
        .container{max-width:600px;margin:0 auto;padding:20px}
        .header{background:#667eea;color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}
        .content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}
        table{width:100%;border-collapse:collapse}
        th{background:#f0f0f0;padding:10px;text-align:left;border-bottom:2px solid #ddd}
        .summary-row td{padding:8px 10px;border-bottom:1px solid #eee}
        .old-fee{text-decoration:line-through;color:#e74c3c;margin-right:8px}
        .new-fee{color:#27ae60;font-weight:bold}
        .total-row td{padding:12px 10px;font-weight:bold;font-size:15px;border-top:2px solid #667eea}
        .token-box{background:white;padding:12px 16px;border-left:4px solid #667eea;margin:16px 0;font-size:13px}
        .button{display:inline-block;background:#667eea;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:20px 0}
        .notice{background:#fff3cd;border-left:4px solid #ffc107;padding:12px 16px;margin:16px 0;font-size:13px}
        .footer{text-align:center;margin-top:20px;color:#666;font-size:12px}
      </style></head><body>
      <div class="container">
        <div class="header"><h1>🚚 Delivery Fee Updated</h1></div>
        <div class="content">
          <p>Dear ${order.customer_name || ''},</p>
          <p>The delivery fee for your order <strong>#${order.id}</strong> has been updated by our team based on your exact location.</p>

          <div class="token-box">
            <strong>Tracking Code:</strong> <code style="color:#667eea;">${order.token}</code>
          </div>

          <h3 style="margin-bottom:8px;">Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
              <tr class="summary-row">
                <td colspan="2" style="text-align:right;color:#555;">Products Subtotal</td>
                <td style="text-align:right;">KSH ${subtotal.toFixed(2)}</td>
              </tr>
              <tr class="summary-row">
                <td colspan="2" style="text-align:right;color:#555;">Delivery Fee</td>
                <td style="text-align:right;">
                  <span class="old-fee">KSH ${oldShipping.toFixed(2)}</span>
                  <span class="new-fee">KSH ${newShipping.toFixed(2)}</span>
                </td>
              </tr>
              <tr class="total-row">
                <td colspan="2" style="text-align:right;">New Total</td>
                <td style="text-align:right;">KSH ${newTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="notice">📦 Your order is being processed. You will be notified when payment is requested.</div>
          <a href="${frontendUrl}/track/${order.token}" class="button">Track Your Order</a>
          <p>For questions, contact us at <a href="mailto:esenapharmacy@gmail.com">esenapharmacy@gmail.com</a> or call 0768103599.</p>
        </div>
        <div class="footer"><p>Esena Pharmacy - Your Trusted Healthcare Partner</p><p>OUTERING ROAD BEHIND EASTMART SUPERMARKET RUARAKA, NAIROBI</p></div>
      </div></body></html>`;

      await sendEmail({
        to: order.email,
        subject: `Delivery Fee Updated - Order #${order.id} - Esena Pharmacy`,
        html
      });
    } catch (emailErr) {
      console.error('Shipping update email failed:', emailErr);
    }

    res.json({ message: 'Shipping cost updated', shipping_cost: newShipping, total: newTotal });
  } catch (error) {
    console.error('Update shipping cost error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};
