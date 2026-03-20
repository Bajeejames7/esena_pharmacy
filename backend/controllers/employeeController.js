const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { sendEmail } = require('../config/mail');
const { logger } = require('../utils/logger');

// Generate a random OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

/**
 * Admin: Create a new employee
 * No OTP is sent on creation — employee uses "Forgot Password" with their email to set their password.
 */
exports.createEmployee = async (req, res) => {
  try {
    const { username, email, full_name, phone, role = 'employee' } = req.body;

    if (!username || !email || !full_name) {
      return res.status(400).json({ message: 'username, email and full_name are required' });
    }

    if (!['employee', 'doctor'].includes(role)) {
      return res.status(400).json({ message: 'role must be employee or doctor' });
    }

    // Check uniqueness
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?', [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }

    const placeholder = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    const [result] = await db.query(
      `INSERT INTO users (username, email, full_name, phone, password, role, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [username, email, full_name, phone || null, placeholder, role]
    );

    // Send welcome email — instruct them to use "Forgot Password" to set their password
    const frontendUrl = process.env.FRONTEND_URL || 'https://esena.co.ke';
    await sendEmail({
      to: email,
      subject: 'Welcome to Esena Pharmacy - Activate Your Account',
      html: `
        <!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
          .container{max-width:600px;margin:0 auto;padding:20px}
          .header{background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}
          .content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}
          .btn{display:inline-block;background:#667eea;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0}
          .footer{text-align:center;margin-top:20px;color:#666;font-size:12px}
        </style></head><body>
        <div class="container">
          <div class="header"><h1>Welcome to Esena Pharmacy!</h1></div>
          <div class="content">
            <p>Hi ${full_name},</p>
            <p>An admin has created an account for you. To activate your account and set your password:</p>
            <ol>
              <li>Go to the login page</li>
              <li>Click <strong>"Forgot Password"</strong></li>
              <li>Enter your email address: <strong>${email}</strong></li>
              <li>You will receive a one-time code to set your password</li>
            </ol>
            <a href="${frontendUrl}/admin/login" class="btn">Go to Login</a>
            <p><strong>Your username:</strong> ${username}</p>
            <p>If you did not expect this email, please ignore it.</p>
          </div>
          <div class="footer"><p>Esena Pharmacy - Your Trusted Healthcare Partner</p></div>
        </div></body></html>
      `
    });

    logger.audit('EMPLOYEE_CREATED', { createdBy: req.user.userId, newUserId: result.insertId, username, email });

    res.status(201).json({ message: 'Employee created. Invitation email sent.', id: result.insertId });
  } catch (error) {
    logger.error('Create employee error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Admin: Get all employees
 */
exports.getEmployees = async (req, res) => {
  try {
    const [employees] = await db.query(
      `SELECT id, username, email, full_name, phone, role, status, last_login, created_at
       FROM users WHERE role != 'admin' ORDER BY created_at DESC`
    );
    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Admin: Update employee (status, role, etc.)
 */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role, full_name, phone, username, email } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE id = ? AND role != ?', [id, 'admin']);
    if (users.length === 0) return res.status(404).json({ message: 'Employee not found' });

    const updates = [];
    const values = [];

    if (status && ['active', 'inactive'].includes(status)) { updates.push('status = ?'); values.push(status); }
    if (role && ['employee', 'doctor'].includes(role)) { updates.push('role = ?'); values.push(role); }
    if (full_name) { updates.push('full_name = ?'); values.push(full_name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (username) {
      const [dup] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
      if (dup.length > 0) return res.status(409).json({ message: 'Username already taken' });
      updates.push('username = ?'); values.push(username);
    }
    if (email) {
      const [dup] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (dup.length > 0) return res.status(409).json({ message: 'Email already in use' });
      updates.push('email = ?'); values.push(email);
    }

    if (updates.length === 0) return res.status(400).json({ message: 'No valid fields to update' });

    values.push(id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    logger.audit('EMPLOYEE_UPDATED', { updatedBy: req.user.userId, employeeId: id, changes: req.body });
    res.json({ message: 'Employee updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Admin: Delete employee
 */
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query('SELECT id FROM users WHERE id = ? AND role != ?', [id, 'admin']);
    if (users.length === 0) return res.status(404).json({ message: 'Employee not found' });

    await db.query('DELETE FROM users WHERE id = ?', [id]);
    logger.audit('EMPLOYEE_DELETED', { deletedBy: req.user.userId, employeeId: id });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Admin: Resend OTP to employee
 */
exports.resendOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query('SELECT * FROM users WHERE id = ? AND role != ?', [id, 'admin']);
    if (users.length === 0) return res.status(404).json({ message: 'Employee not found' });

    const user = users[0];
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query('UPDATE users SET otp = ?, otp_expires = ?, status = ? WHERE id = ?',
      [otp, otpExpires, 'pending', id]);

    const frontendUrl = process.env.FRONTEND_URL || 'https://esena.co.ke';
    await sendEmail({
      to: user.email,
      subject: 'Esena Pharmacy - New One-Time Password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <h2 style="color:#667eea">New Login OTP</h2>
          <p>Hi ${user.full_name || user.username},</p>
          <p>Your new one-time password is:</p>
          <div style="background:#f0f0ff;border:2px solid #667eea;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
            <span style="font-size:36px;font-weight:bold;color:#667eea;letter-spacing:8px">${otp}</span>
          </div>
          <p>This OTP expires in 24 hours. Login at: <a href="${frontendUrl}/admin/login">${frontendUrl}/admin/login</a></p>
        </div>
      `
    });

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get activity log (admin only)
 */
exports.getActivityLog = async (req, res) => {
  try {
    const { resource_type, resource_id, user_id, limit = 50, offset = 0, search } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (resource_type) { where += ' AND resource_type = ?'; params.push(resource_type); }
    if (resource_id)   { where += ' AND resource_id = ?';   params.push(resource_id); }
    if (user_id)       { where += ' AND user_id = ?';       params.push(user_id); }
    if (search) {
      where += ' AND (user_name LIKE ? OR action LIKE ? OR description LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM activity_log ${where}`, params);
    const [logs] = await db.query(
      `SELECT * FROM activity_log ${where} ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );
    res.json({ logs, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
