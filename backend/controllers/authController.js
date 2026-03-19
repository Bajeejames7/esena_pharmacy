const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { sendEmail } = require('../config/mail');
const { logger } = require('../utils/logger');

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const signToken = (user) => jwt.sign(
  { userId: user.id, role: user.role, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

exports.login = async (req, res) => {
  try {
    const { username, password, two_fa_code } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' });
    }
    const [users] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (users.length === 0) {
      logger.authFailure('USER_NOT_FOUND', { username }, req);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = users[0];
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact the admin.' });
    }
    if (user.status === 'pending') {
      if (!user.otp || user.otp !== password) return res.status(401).json({ message: 'Invalid one-time password' });
      if (new Date() > new Date(user.otp_expires)) return res.status(401).json({ message: 'OTP has expired. Ask admin to resend.' });
      return res.json({
        requiresPasswordSetup: true,
        setupToken: jwt.sign({ userId: user.id, purpose: 'setup' }, process.env.JWT_SECRET, { expiresIn: '1h' })
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.authFailure('INVALID_PASSWORD', { username: user.username, userId: user.id }, req);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.two_fa_enabled) {
      if (!two_fa_code) return res.json({ requires2FA: true });
      try {
        const speakeasy = require('speakeasy');
        const valid = speakeasy.totp.verify({ secret: user.two_fa_secret, encoding: 'base32', token: two_fa_code, window: 1 });
        if (!valid) return res.status(401).json({ message: 'Invalid 2FA code' });
      } catch (e) { return res.status(500).json({ message: '2FA verification failed' }); }
    }
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    const token = signToken(user);
    logger.audit('USER_LOGIN_SUCCESS', { userId: user.id, username: user.username, role: user.role }, req);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name } });
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ message: 'Unable to process login request' });
  }
};

exports.setupPassword = async (req, res) => {
  try {
    const { setup_token, new_password } = req.body;
    if (!setup_token || !new_password || new_password.length < 8)
      return res.status(400).json({ message: 'setup_token and new_password (min 8 chars) required' });
    let decoded;
    try { decoded = jwt.verify(setup_token, process.env.JWT_SECRET); }
    catch { return res.status(401).json({ message: 'Invalid or expired setup token' }); }
    if (decoded.purpose !== 'setup') return res.status(401).json({ message: 'Invalid token' });
    const hashed = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE users SET password = ?, status = 'active', otp = NULL, otp_expires = NULL WHERE id = ?", [hashed, decoded.userId]);
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    const user = users[0];
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name } });
  } catch (error) {
    logger.error('Setup password error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0 || users[0].status === 'inactive')
      return res.json({ message: 'If that email exists, a reset code has been sent' });
    const user = users[0];
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 30 * 60 * 1000);
    await db.query('UPDATE users SET otp = ?, otp_expires = ? WHERE id = ?', [otp, otpExpires, user.id]);
    await sendEmail({
      to: email,
      subject: 'Esena Pharmacy - Password Reset Code',
      html: `<p>Your reset code: <strong>${otp}</strong>. Expires in 30 minutes.</p>`
    });
    res.json({ message: 'If that email exists, a reset code has been sent' });
  } catch (error) {
    logger.error('Password reset request error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.confirmPasswordReset = async (req, res) => {
  try {
    const { email, otp_code, new_password } = req.body;
    if (!email || !otp_code || !new_password || new_password.length < 8)
      return res.status(400).json({ message: 'email, otp_code and new_password (min 8 chars) required' });
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ message: 'Invalid reset code' });
    const user = users[0];
    if (!user.otp || user.otp !== otp_code) return res.status(400).json({ message: 'Invalid reset code' });
    if (new Date() > new Date(user.otp_expires)) return res.status(400).json({ message: 'Reset code has expired' });
    const hashed = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE users SET password = ?, otp = NULL, otp_expires = NULL, status = 'active' WHERE id = ?", [hashed, user.id]);
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    logger.error('Confirm password reset error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, current_password, new_password } = req.body;
    const userId = req.user.userId;
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users[0];
    const updates = []; const values = [];
    if (username && username !== user.username) {
      const [dup] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
      if (dup.length > 0) return res.status(409).json({ message: 'Username already taken' });
      updates.push('username = ?'); values.push(username);
    }
    if (email && email !== user.email) {
      const [dup] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (dup.length > 0) return res.status(409).json({ message: 'Email already in use' });
      updates.push('email = ?'); values.push(email);
    }
    if (new_password) {
      if (!current_password) return res.status(400).json({ message: 'current_password required to change password' });
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
      if (new_password.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
      updates.push('password = ?'); values.push(await bcrypt.hash(new_password, 10));
    }
    if (updates.length === 0) return res.status(400).json({ message: 'Nothing to update' });
    values.push(userId);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    const [updated] = await db.query('SELECT id, username, email, role, full_name FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Profile updated', user: updated[0] });
  } catch (error) {
    logger.error('Update profile error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setup2FA = async (req, res) => {
  try {
    const speakeasy = require('speakeasy');
    const qrcode = require('qrcode');
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    const user = users[0];
    const secret = speakeasy.generateSecret({ name: `Esena Pharmacy (${user.username})` });
    await db.query('UPDATE users SET two_fa_secret = ? WHERE id = ?', [secret.base32, user.id]);
    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ secret: secret.base32, qrCode: qrDataUrl });
  } catch (error) {
    logger.error('2FA setup error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.confirm2FA = async (req, res) => {
  try {
    const speakeasy = require('speakeasy');
    const { token } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    const user = users[0];
    const valid = speakeasy.totp.verify({ secret: user.two_fa_secret, encoding: 'base32', token, window: 1 });
    if (!valid) return res.status(400).json({ message: 'Invalid 2FA code' });
    await db.query('UPDATE users SET two_fa_enabled = 1 WHERE id = ?', [user.id]);
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    logger.error('2FA confirm error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.disable2FA = async (req, res) => {
  try {
    const speakeasy = require('speakeasy');
    const { token } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    const user = users[0];
    const valid = speakeasy.totp.verify({ secret: user.two_fa_secret, encoding: 'base32', token, window: 1 });
    if (!valid) return res.status(400).json({ message: 'Invalid 2FA code' });
    await db.query('UPDATE users SET two_fa_enabled = 0, two_fa_secret = NULL WHERE id = ?', [user.id]);
    res.json({ message: '2FA disabled' });
  } catch (error) {
    logger.error('2FA disable error', error);
    res.status(500).json({ message: 'Server error' });
  }
};
