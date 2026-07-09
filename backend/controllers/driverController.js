/**
 * Driver Controller
 * Handles driver registration, authentication, delivery assignments, and proof of delivery
 */

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ──────────────────────────────────────────────────────────────
// ADMIN: Register a new driver
// POST /api/admin/drivers
// ──────────────────────────────────────────────────────────────
exports.registerDriver = async (req, res) => {
  const {
    name, phone, email, password, national_id, license_number,
    vehicle_type, vehicle_registration
  } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone, and password are required' });
  }

  try {
    // Check if phone or email already exists
    const [existing] = await db.query(
      'SELECT id FROM drivers WHERE phone = ? OR (email IS NOT NULL AND email = ?)',
      [phone, email || null]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Driver with this phone or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO drivers (name, phone, email, password_hash, national_id, license_number, vehicle_type, vehicle_registration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email || null, passwordHash, national_id || null, license_number || null, vehicle_type || 'bike', vehicle_registration || null]
    );

    logger.info('Driver registered', { driverId: result.insertId, createdBy: req.user?.userId || req.user?.id });

    return res.json({
      success: true,
      message: 'Driver registered successfully',
      driver: { id: result.insertId, name, phone, email }
    });
  } catch (err) {
    logger.error('Driver registration error', err);
    return res.status(500).json({ error: 'Failed to register driver', details: err.message });
  }
};

// ──────────────────────────────────────────────────────────────
// ADMIN: Get all drivers
// GET /api/admin/drivers
// ──────────────────────────────────────────────────────────────
exports.getAllDrivers = async (req, res) => {
  try {
    const [drivers] = await db.query(`
      SELECT d.*,
             COUNT(DISTINCT del.id) as total_deliveries,
             COUNT(DISTINCT CASE WHEN del.status = 'delivered' THEN del.id END) as completed_deliveries,
             COUNT(DISTINCT CASE WHEN del.status = 'assigned' OR del.status = 'out_for_delivery' THEN del.id END) as active_deliveries
      FROM drivers d
      LEFT JOIN deliveries del ON del.driver_id = d.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);

    // Remove password hash from response
    const sanitized = drivers.map(({ password_hash, ...driver }) => driver);

    return res.json({ success: true, drivers: sanitized });
  } catch (err) {
    logger.error('Get drivers error', err);
    return res.status(500).json({ error: 'Failed to fetch drivers', details: err.message });
  }
};

// ──────────────────────────────────────────────────────────────
// ADMIN: Update driver details
// PUT /api/admin/drivers/:id
// ──────────────────────────────────────────────────────────────
exports.updateDriver = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, national_id, license_number, vehicle_type, vehicle_registration, status } = req.body;

  try {
    await db.query(
      `UPDATE drivers 
       SET name = ?, phone = ?, email = ?, national_id = ?, license_number = ?, 
           vehicle_type = ?, vehicle_registration = ?, status = ?
       WHERE id = ?`,
      [name, phone, email || null, national_id || null, license_number || null, vehicle_type, vehicle_registration || null, status, id]
    );

    logger.info('Driver updated', { driverId: id, updatedBy: req.user?.userId || req.user?.id });

    return res.json({ success: true, message: 'Driver updated successfully' });
  } catch (err) {
    logger.error('Update driver error', err);
    return res.status(500).json({ error: 'Failed to update driver' });
  }
};

// ──────────────────────────────────────────────────────────────
// DRIVER: Request password reset (admin must reset)
// POST /api/drivers/request-reset
// ──────────────────────────────────────────────────────────────
exports.requestPasswordReset = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const [[driver]] = await db.query(
      'SELECT id, name, phone FROM drivers WHERE phone = ?',
      [phone]
    );

    if (!driver) {
      // Return success even if driver not found (security best practice)
      return res.json({ 
        success: true, 
        message: 'If this phone number is registered, the admin will be notified to reset your password.' 
      });
    }

    logger.info('Password reset requested', { driverId: driver.id, phone });

    return res.json({ 
      success: true, 
      message: 'Password reset request received. Please contact your admin to reset your password.' 
    });
  } catch (err) {
    logger.error('Password reset request error', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
};

// ──────────────────────────────────────────────────────────────
// ADMIN: Reset driver password
// PUT /api/admin/drivers/:id/reset-password
// ──────────────────────────────────────────────────────────────
exports.resetDriverPassword = async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    const [[driver]] = await db.query('SELECT * FROM drivers WHERE id = ?', [id]);
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    await db.query(
      'UPDATE drivers SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );

    logger.info('Driver password reset by admin', { 
      driverId: id, 
      resetBy: req.user?.userId || req.user?.id 
    });

    return res.json({ 
      success: true, 
      message: 'Driver password reset successfully' 
    });
  } catch (err) {
    logger.error('Reset driver password error', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};

// ──────────────────────────────────────────────────────────────
// DRIVER: Login
// POST /api/drivers/login
// ──────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required' });
  }

  try {
    const [[driver]] = await db.query(
      'SELECT * FROM drivers WHERE phone = ? AND status = "active"',
      [phone]
    );

    if (!driver) {
      logger.security('DRIVER_LOGIN_FAILED', {
        reason: 'Invalid credentials or inactive',
        phone: phone.substring(0, 4) + '****' // Partial phone for security
      }, req);
      return res.status(401).json({ error: 'Invalid credentials or driver is inactive' });
    }

    const isValidPassword = await bcrypt.compare(password, driver.password_hash);
    if (!isValidPassword) {
      logger.security('DRIVER_LOGIN_FAILED', {
        reason: 'Invalid password',
        driverId: driver.id,
        driverName: driver.name
      }, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { driverId: driver.id, phone: driver.phone, role: 'driver' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login timestamp
    await db.query(
      'UPDATE drivers SET updated_at = NOW() WHERE id = ?',
      [driver.id]
    );

    logger.audit('DRIVER_LOGIN_SUCCESS', {
      driverId: driver.id,
      driverName: driver.name,
      phone: driver.phone,
      vehicleType: driver.vehicle_type
    }, req);

    // Remove password hash
    const { password_hash, ...driverData } = driver;

    return res.json({
      success: true,
      token,
      driver: driverData
    });
  } catch (err) {
    logger.error('Driver login error', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};

// ──────────────────────────────────────────────────────────────
// DRIVER: Get my deliveries
// GET /api/drivers/deliveries
// ──────────────────────────────────────────────────────────────
exports.getMyDeliveries = async (req, res) => {
  const driverId = req.driver.driverId;

  try {
    const [deliveries] = await db.query(`
      SELECT 
        del.*,
        o.id as order_id,
        o.token as order_token,
        o.customer_name,
        o.phone as customer_phone,
        o.email as customer_email,
        o.delivery_address,
        o.delivery_zone,
        o.total as order_total,
        o.notes as order_notes,
        o.created_at as order_created_at,
        u.username as assigned_by_name
      FROM deliveries del
      INNER JOIN orders o ON o.id = del.order_id
      LEFT JOIN users u ON u.id = del.assigned_by
      WHERE del.driver_id = ?
      ORDER BY 
        CASE del.status
          WHEN 'out_for_delivery' THEN 1
          WHEN 'assigned' THEN 2
          WHEN 'delivered' THEN 3
          WHEN 'failed' THEN 4
        END,
        del.assigned_at DESC
    `, [driverId]);

    return res.json({ success: true, deliveries });
  } catch (err) {
    logger.error('Get driver deliveries error', err, { driverId });
    return res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};

// ──────────────────────────────────────────────────────────────
// DRIVER: Update delivery status
// PUT /api/drivers/deliveries/:id/status
// ──────────────────────────────────────────────────────────────
exports.updateDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes, failed_reason } = req.body;
  const driverId = req.driver.driverId;

  if (!['out_for_delivery', 'delivered', 'failed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Validate failed_reason is provided when marking as failed
  if (status === 'failed' && (!failed_reason || failed_reason.trim() === '')) {
    return res.status(400).json({ error: 'Failed reason is required when marking delivery as failed' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verify this delivery belongs to this driver
    const [[delivery]] = await conn.query(
      'SELECT * FROM deliveries WHERE id = ? AND driver_id = ?',
      [id, driverId]
    );

    if (!delivery) {
      await conn.rollback();
      return res.status(404).json({ error: 'Delivery not found or access denied' });
    }

    // Update delivery status
    const updates = {
      status,
      delivery_notes: notes || delivery.delivery_notes,
      failed_reason: failed_reason || null,
      started_at: status === 'out_for_delivery' && !delivery.started_at ? new Date() : delivery.started_at,
      completed_at: status === 'delivered' ? new Date() : delivery.completed_at
    };

    await conn.query(
      `UPDATE deliveries 
       SET status = ?, delivery_notes = ?, failed_reason = ?, started_at = ?, completed_at = ?
       WHERE id = ?`,
      [updates.status, updates.delivery_notes, updates.failed_reason, updates.started_at, updates.completed_at, id]
    );

    // Update order status accordingly
    let orderStatus = delivery.order_id;
    if (status === 'out_for_delivery') {
      await conn.query('UPDATE orders SET status = ? WHERE id = ?', ['out_for_delivery', delivery.order_id]);
    } else if (status === 'delivered') {
      await conn.query('UPDATE orders SET status = ? WHERE id = ?', ['completed', delivery.order_id]);
    } else if (status === 'failed') {
      await conn.query('UPDATE orders SET status = ? WHERE id = ?', ['dispatched', delivery.order_id]);
    }

    await conn.commit();

    logger.audit('DELIVERY_STATUS_UPDATED', { 
      deliveryId: id, 
      driverId, 
      driverName: delivery.driver_id,
      orderId: delivery.order_id,
      oldStatus: delivery.status,
      newStatus: status,
      notes: notes || null,
      failedReason: status === 'failed' ? failed_reason : null
    }, req);

    return res.json({ success: true, message: 'Delivery status updated' });
  } catch (err) {
    await conn.rollback();
    logger.error('Update delivery status error', err);
    return res.status(500).json({ error: 'Failed to update delivery status' });
  } finally {
    conn.release();
  }
};

// ──────────────────────────────────────────────────────────────
// DRIVER: Upload proof of delivery
// POST /api/drivers/deliveries/:id/proof
// ──────────────────────────────────────────────────────────────
exports.uploadProof = async (req, res) => {
  const { id } = req.params;
  const driverId = req.driver.driverId;

  if (!req.file) {
    return res.status(400).json({ error: 'Photo is required' });
  }

  try {
    // Verify this delivery belongs to this driver
    const [[delivery]] = await db.query(
      'SELECT * FROM deliveries WHERE id = ? AND driver_id = ?',
      [id, driverId]
    );

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found or access denied' });
    }

    const proofUrl = `/uploads/proof/${req.file.filename}`;

    await db.query(
      'UPDATE deliveries SET proof_of_delivery = ? WHERE id = ?',
      [proofUrl, id]
    );

    logger.audit('PROOF_OF_DELIVERY_UPLOADED', { 
      deliveryId: id, 
      driverId,
      orderId: delivery.order_id,
      proofUrl,
      fileName: req.file.filename
    }, req);

    return res.json({
      success: true,
      message: 'Proof of delivery uploaded',
      proof_url: proofUrl
    });
  } catch (err) {
    logger.error('Upload proof error', err);
    return res.status(500).json({ error: 'Failed to upload proof' });
  }
};

// ──────────────────────────────────────────────────────────────
// ADMIN: Assign order to driver
// POST /api/admin/deliveries/assign
// ──────────────────────────────────────────────────────────────
exports.assignDelivery = async (req, res) => {
  const { order_id, driver_id } = req.body;
  const assignedBy = req.user.userId || req.user.id;

  if (!order_id || !driver_id) {
    return res.status(400).json({ error: 'Order ID and Driver ID are required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verify order exists and is paid
    const [[order]] = await conn.query(
      'SELECT * FROM orders WHERE id = ? AND status IN ("paid", "dispatched")',
      [order_id]
    );

    if (!order) {
      await conn.rollback();
      return res.status(404).json({ error: 'Order not found or not ready for delivery' });
    }

    // Verify driver exists and is active
    const [[driver]] = await conn.query(
      'SELECT * FROM drivers WHERE id = ? AND status = "active"',
      [driver_id]
    );

    if (!driver) {
      await conn.rollback();
      return res.status(404).json({ error: 'Driver not found or inactive' });
    }

    // Check if order already has an active delivery
    const [[existingDelivery]] = await conn.query(
      'SELECT * FROM deliveries WHERE order_id = ? AND status IN ("assigned", "out_for_delivery")',
      [order_id]
    );

    if (existingDelivery) {
      await conn.rollback();
      return res.status(400).json({ error: 'Order already has an active delivery assignment' });
    }

    // Create new delivery assignment
    const [result] = await conn.query(
      `INSERT INTO deliveries (order_id, driver_id, assigned_by)
       VALUES (?, ?, ?)`,
      [order_id, driver_id, assignedBy]
    );

    // Update order status and link to delivery
    await conn.query(
      'UPDATE orders SET status = "dispatched", current_delivery_id = ?, driver_assigned_at = NOW() WHERE id = ?',
      [result.insertId, order_id]
    );

    await conn.commit();

    logger.audit('DELIVERY_ASSIGNED', { 
      orderId: order_id, 
      driverId: driver_id,
      driverName: driver.name,
      assignedBy,
      deliveryId: result.insertId,
      customerName: order.customer_name,
      orderTotal: order.total
    }, req);

    return res.json({
      success: true,
      message: 'Delivery assigned successfully',
      delivery_id: result.insertId
    });
  } catch (err) {
    await conn.rollback();
    logger.error('Assign delivery error', err);
    return res.status(500).json({ error: 'Failed to assign delivery' });
  } finally {
    conn.release();
  }
};

// ──────────────────────────────────────────────────────────────
// ADMIN: Reassign delivery to different driver
// POST /api/admin/deliveries/:id/reassign
// ──────────────────────────────────────────────────────────────
exports.reassignDelivery = async (req, res) => {
  const { id } = req.params;
  const { new_driver_id, reason } = req.body;
  const reassignedBy = req.user.userId || req.user.id;

  if (!new_driver_id) {
    return res.status(400).json({ error: 'New driver ID is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Get current delivery
    const [[delivery]] = await conn.query(
      'SELECT * FROM deliveries WHERE id = ?',
      [id]
    );

    if (!delivery) {
      await conn.rollback();
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.status === 'delivered') {
      await conn.rollback();
      return res.status(400).json({ error: 'Cannot reassign completed delivery' });
    }

    // Verify new driver exists and is active
    const [[newDriver]] = await conn.query(
      'SELECT * FROM drivers WHERE id = ? AND status = "active"',
      [new_driver_id]
    );

    if (!newDriver) {
      await conn.rollback();
      return res.status(404).json({ error: 'New driver not found or inactive' });
    }

    // Log the reassignment
    await conn.query(
      `INSERT INTO delivery_reassignments (delivery_id, order_id, old_driver_id, new_driver_id, reassigned_by, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, delivery.order_id, delivery.driver_id, new_driver_id, reassignedBy, reason || null]
    );

    // Update delivery with new driver and reset status
    await conn.query(
      `UPDATE deliveries 
       SET driver_id = ?, status = 'assigned', assigned_at = NOW(), started_at = NULL
       WHERE id = ?`,
      [new_driver_id, id]
    );

    // Update order status back to dispatched
    await conn.query(
      'UPDATE orders SET status = "dispatched" WHERE id = ?',
      [delivery.order_id]
    );

    await conn.commit();

    logger.audit('DELIVERY_REASSIGNED', { 
      deliveryId: id, 
      orderId: delivery.order_id,
      oldDriverId: delivery.driver_id, 
      newDriverId: new_driver_id,
      newDriverName: newDriver.name,
      reassignedBy,
      reason: reason || 'No reason provided'
    }, req);

    return res.json({
      success: true,
      message: 'Delivery reassigned successfully'
    });
  } catch (err) {
    await conn.rollback();
    logger.error('Reassign delivery error', err);
    return res.status(500).json({ error: 'Failed to reassign delivery' });
  } finally {
    conn.release();
  }
};

// ──────────────────────────────────────────────────────────────
// ADMIN: Get all deliveries
// GET /api/admin/deliveries
// ──────────────────────────────────────────────────────────────
exports.getAllDeliveries = async (req, res) => {
  try {
    const [deliveries] = await db.query(`
      SELECT 
        del.*,
        o.token as order_token,
        o.customer_name,
        o.delivery_address,
        o.total as order_total,
        d.name as driver_name,
        d.phone as driver_phone,
        d.vehicle_type,
        u.username as assigned_by_name
      FROM deliveries del
      INNER JOIN orders o ON o.id = del.order_id
      INNER JOIN drivers d ON d.id = del.driver_id
      LEFT JOIN users u ON u.id = del.assigned_by
      ORDER BY del.assigned_at DESC
    `);

    return res.json({ success: true, deliveries });
  } catch (err) {
    logger.error('Get all deliveries error', err);
    return res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};

module.exports = exports;
