const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const {
  sendEmail,
  prescriptionReceivedTemplate,
  prescriptionAdminNotificationTemplate,
  prescriptionStatusUpdateTemplate,
  orderConfirmationTemplate,
  orderAdminNotificationTemplate
} = require('../config/mail');
const { generateUniqueToken } = require('../utils/tokenGenerator');

/**
 * POST /api/prescriptions/upload
 */
exports.uploadPrescription = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ success: false, message: 'Name, phone, and email are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Prescription file is required.' });
    }

    const filePath = req.file.filename;

    const [result] = await db.query(
      `INSERT INTO prescriptions (name, phone, email, message, file_path, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [name, phone, email, message || null, filePath]
    );

    const prescription = { id: result.insertId, name, phone, email, message, file_path: filePath };

    // Send emails (non-blocking — don't fail the request if email fails)
    Promise.allSettled([
      sendEmail({ to: email, ...prescriptionReceivedTemplate(prescription) }),
      sendEmail({ to: process.env.EMAIL_USER, ...prescriptionAdminNotificationTemplate(prescription) })
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Prescription email ${i} failed:`, r.reason);
      });
    });

    res.status(201).json({
      success: true,
      message: 'Prescription submitted successfully. Our pharmacist will contact you within 2 hours.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Prescription upload error:', error);
    if (req.file) {
      const fp = path.join(__dirname, '../uploads/prescriptions', req.file.filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    res.status(500).json({ success: false, message: 'Failed to submit prescription. Please try again.' });
  }
};

/**
 * GET /api/prescriptions  (admin)
 */
exports.getPrescriptions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM prescriptions ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch prescriptions.' });
  }
};

/**
 * PATCH /api/prescriptions/:id/status  (admin)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'reviewed', 'completed', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    // Fetch prescription for email
    const [rows] = await db.query('SELECT * FROM prescriptions WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    await db.query('UPDATE prescriptions SET status = ? WHERE id = ?', [status, id]);

    // Notify patient on meaningful status changes
    if (['reviewed', 'completed', 'cancelled'].includes(status)) {
      const template = prescriptionStatusUpdateTemplate(rows[0], status);
      sendEmail({ to: rows[0].email, ...template }).catch(err =>
        console.error('Prescription status email failed:', err.message)
      );
    }

    res.json({ success: true, message: 'Status updated.' });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

/**
 * POST /api/prescriptions/:id/create-order  (admin)
 * Creates a real order from a prescription submission.
 * Items are free-text medicine lines (name + price) entered by the admin
 * after calling the patient — no product_id required.
 *
 * Body: {
 *   delivery_address, delivery_type, delivery_zone, shipping_cost, notes,
 *   items: [{ name, quantity, price }]
 * }
 */
exports.createOrderFromPrescription = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const {
      delivery_address,
      delivery_type = 'delivery',
      delivery_zone = 'nairobi',
      shipping_cost = 0,
      notes,
      items
    } = req.body;

    if (!delivery_address) {
      return res.status(400).json({ success: false, message: 'Delivery address is required.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one medicine item is required.' });
    }

    // Fetch prescription
    const [rows] = await db.query('SELECT * FROM prescriptions WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }
    const prescription = rows[0];

    const resolvedShipping = parseFloat(shipping_cost) || 0;
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * parseInt(item.quantity), 0);
    const total = subtotal + resolvedShipping;
    const token = await generateUniqueToken();

    await connection.beginTransaction();

    // Create the order (no product_id — prescription orders use free-text items)
    const [orderResult] = await connection.query(
      `INSERT INTO orders (customer_name, email, phone, delivery_address, notes, delivery_type, delivery_zone, shipping_cost, total, token, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        prescription.name,
        prescription.email,
        prescription.phone,
        delivery_address,
        notes || `Prescription order #${id}`,
        delivery_type,
        delivery_zone,
        resolvedShipping,
        total,
        token
      ]
    );

    const orderId = orderResult.insertId;

    // Insert free-text medicine items (no product_id for prescription orders)
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, item_name) VALUES (?, NULL, ?, ?, ?)`,
        [orderId, parseInt(item.quantity), parseFloat(item.price), item.name]
      );
    }

    // Store prescription reference in notes
    const itemSummary = items.map(i => `${i.name} x${i.quantity} @ KSH ${parseFloat(i.price).toFixed(2)}`).join('; ');
    await connection.query(
      `UPDATE orders SET notes = ? WHERE id = ?`,
      [`Prescription #${id} | ${itemSummary}${notes ? ' | ' + notes : ''}`, orderId]
    );

    // Mark prescription as completed
    await connection.query(`UPDATE prescriptions SET status = 'completed' WHERE id = ?`, [id]);

    await connection.commit();

    // Build email-friendly items list
    const emailItems = items.map(i => ({
      name: i.name,
      quantity: parseInt(i.quantity),
      price: parseFloat(i.price)
    }));

    const orderForEmail = {
      customer_name: prescription.name,
      email: prescription.email,
      phone: prescription.phone,
      delivery_address,
      notes: `Prescription order`,
      delivery_type,
      delivery_zone,
      shipping_cost: resolvedShipping,
      subtotal,
      total,
      token
    };

    // Send order confirmation emails
    Promise.allSettled([
      sendEmail({ to: prescription.email, ...orderConfirmationTemplate(orderForEmail, emailItems) }),
      sendEmail({ to: process.env.EMAIL_USER, ...orderAdminNotificationTemplate(orderForEmail, emailItems) })
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Prescription order email ${i} failed:`, r.reason);
      });
    });

    res.status(201).json({
      success: true,
      message: 'Order created from prescription successfully.',
      orderId,
      token
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order from prescription error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order.', error: error.message });
  } finally {
    connection.release();
  }
};
