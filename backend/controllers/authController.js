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

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password, two_fa_code } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' });
    }
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?', [username, username]
    );
    if (users.length === 0) {
      logger.authFailure('USER_NOT_FOUND', { username }, req);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = users[0];
    if (user.status === 'inactive') {
      logger.authFailure('ACCOUNT_INACTIVE', { username: user.username, userId: user.id }, req);
      return res.status(403).json({ message: 'Your account has been deactivated. Contact the admin.' });
    }
    if (user.status === 'pending') {
      logger.authFailure('LOGIN_PENDING_ACCOUNT', { username: user.username, userId: user.id }, req);
      return res.status(403).json({ message: 'Account not yet activated. Use "Forgot Password" with your email to set your password first.' });
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
        if (!valid) {
          logger.authFailure('INVALID_2FA_CODE', { username: user.username, userId: user.id }, req);
          return res.status(401).json({ message: 'Invalid 2FA code' });
        }
      } catch (e) { return res.status(500).json({ message: '2FA verification failed' }); }
    }
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    const token = signToken(user);
    logger.audit('LOGIN_SUCCESS', { userId: user.id, username: user.username, role: user.role }, req);
    require('../utils/activityLog').logActivity({ userId: user.id, userName: user.username, action: 'LOGIN', resourceType: 'auth', description: user.username + ' logged in', ip: req.ip });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name } });
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ message: 'Unable to process login request' });
  }
};

// REQUEST PASSWORD RESET
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    logger.info('PASSWORD_RESET_REQUESTED', { email }, req);
    const [users] = await db.query("SELECT * FROM users WHERE email = ? AND status != 'inactive'", [email]);
    if (users.length === 0) {
      logger.authFailure('RESET_UNKNOWN_EMAIL', { email }, req);
      return res.status(404).json({ message: 'No account found with that email address.' });
    }
    const user = users[0];
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 20 * 60 * 1000);
    await db.query('UPDATE users SET otp = ?, otp_expires = ?, otp_attempts = 0, otp_window_start = NOW() WHERE id = ?', [otp, otpExpires, user.id]);
    logger.audit('OTP_ISSUED', { userId: user.id, username: user.username, email, expiresAt: otpExpires }, req);
    await require('../utils/activityLog').logActivity({ userId: user.id, userName: user.username, action: 'PASSWORD_RESET_REQUESTED', resourceType: 'auth', description: user.username + ' requested a password reset', ip: req.ip });
    console.log('[AUTH] logActivity called for PASSWORD_RESET_REQUESTED');
    const isNewAccount = user.status === 'pending';
    await sendEmail({
      to: email,
      subject: isNewAccount ? 'Esena Pharmacy - Activate Your Account' : 'Esena Pharmacy - Password Reset Code',
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px"><h2 style="color:#667eea">${isNewAccount ? 'Activate Your Account' : 'Password Reset'}</h2><p>Hi ${user.full_name || user.username},</p><p>${isNewAccount ? 'Your account has been created. Use the code below to set your password:' : 'Your password reset code is:'}</p><div style="background:#f0f0ff;border:2px solid #667eea;border-radius:8px;padding:20px;text-align:center;margin:20px 0"><span style="font-size:36px;font-weight:bold;color:#667eea;letter-spacing:8px">${otp}</span></div><p>Expires in <strong>20 minutes</strong>. You have <strong>5 attempts</strong> to enter it correctly.</p><p style="color:#999;font-size:12px">If you did not request this, ignore this email.</p></div>`
    });
    res.json({ message: 'A reset code has been sent to your email.' });
  } catch (error) {
    logger.error('Password reset request error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// VERIFY OTP
const MAX_OTP_ATTEMPTS = 5;
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp_code } = req.body;
    if (!email || !otp_code) return res.status(400).json({ message: 'email and otp_code are required' });
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      logger.authFailure('OTP_VERIFY_UNKNOWN_EMAIL', { email }, req);
      return res.status(400).json({ message: 'Invalid code' });
    }
    const user = users[0];
    const attempts = user.otp_attempts || 0;
    if (attempts >= MAX_OTP_ATTEMPTS) {
      logger.authFailure('OTP_LOCKED_OUT', { email, userId: user.id, attempts }, req);
      return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new reset code.' });
    }
    if (!user.otp || !user.otp_expires || new Date() > new Date(user.otp_expires)) {
      logger.authFailure('OTP_EXPIRED', { email, userId: user.id }, req);
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }
    if (user.otp !== otp_code) {
      const newAttempts = attempts + 1;
      await db.query('UPDATE users SET otp_attempts = ? WHERE id = ?', [newAttempts, user.id]);
      const remaining = MAX_OTP_ATTEMPTS - newAttempts;
      logger.authFailure('OTP_WRONG_CODE', { email, userId: user.id, attempt: newAttempts, remaining }, req);
      if (remaining <= 0) return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new reset code.' });
      return res.status(400).json({ message: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` });
    }
    await db.query('UPDATE users SET otp = NULL, otp_expires = NULL, otp_attempts = 0 WHERE id = ?', [user.id]);
    const resetToken = jwt.sign({ userId: user.id, purpose: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '10m' });
    logger.audit('OTP_VERIFIED', { userId: user.id, username: user.username, email }, req);
    res.json({ message: 'Code verified.', reset_token: resetToken });
  } catch (error) {
    logger.error('Verify OTP error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// CONFIRM PASSWORD RESET
exports.confirmPasswordReset = async (req, res) => {
  try {
    const { reset_token, new_password } = req.body;
    if (!reset_token || !new_password || new_password.length < 8) return res.status(400).json({ message: 'reset_token and new_password (min 8 chars) required' });
    let decoded;
    try { decoded = jwt.verify(reset_token, process.env.JWT_SECRET); }
    catch { return res.status(401).json({ message: 'Reset session expired. Please start over.' }); }
    if (decoded.purpose !== 'password_reset') return res.status(401).json({ message: 'Invalid reset token' });
    const [users] = await db.query('SELECT id, username FROM users WHERE id = ?', [decoded.userId]);
    if (users.length === 0) return res.status(400).json({ message: 'User not found' });
    const user = users[0];
    const hashed = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE users SET password = ?, status = 'active' WHERE id = ?", [hashed, user.id]);
    logger.audit('PASSWORD_RESET_SUCCESS', { userId: user.id, username: user.username }, req);
    await require('../utils/activityLog').logActivity({ userId: user.id, userName: user.username, action: 'PASSWORD_RESET', resourceType: 'auth', description: user.username + ' reset their password', ip: req.ip });
    res.json({ message: 'Password set successfully. You can now log in.' });
  } catch (error) {
    logger.error('Confirm password reset error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE PROFILE
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
      if (!isMatch) {
        logger.authFailure('PROFILE_WRONG_CURRENT_PASSWORD', { userId, username: user.username }, req);
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      if (new_password.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
      updates.push('password = ?'); values.push(await bcrypt.hash(new_password, 10));
    }
    if (updates.length === 0) return res.status(400).json({ message: 'Nothing to update' });
    values.push(userId);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    logger.audit('PROFILE_UPDATED', { userId, fields: updates.map(u => u.split(' ')[0]) }, req);
    const [updated] = await db.query('SELECT id, username, email, role, full_name FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Profile updated', user: updated[0] });
  } catch (error) {
    logger.error('Update profile error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// SETUP PASSWORD — disabled, redirect to forgot-password flow
exports.setupPassword = async (req, res) => {
  return res.status(410).json({ message: 'This endpoint is no longer active. Please use the forgot password flow.' });
};

// 2FA
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
  } catch (error) { logger.error('2FA setup error', error); res.status(500).json({ message: 'Server error' }); }
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
    logger.audit('2FA_ENABLED', { userId: user.id, username: user.username }, req);
    res.json({ message: '2FA enabled successfully' });
  } catch (error) { logger.error('2FA confirm error', error); res.status(500).json({ message: 'Server error' }); }
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
    logger.audit('2FA_DISABLED', { userId: user.id, username: user.username }, req);
    res.json({ message: '2FA disabled' });
  } catch (error) { logger.error('2FA disable error', error); res.status(500).json({ message: 'Server error' }); }
};

// LOGOUT
exports.logout = async (req, res) => {
  const userId = req.user ? req.user.userId : null;
  const username = req.user ? req.user.username : null;
  const reason = (req.body && req.body.reason) ? req.body.reason : 'manual';
  await require('../utils/activityLog').logActivity({ userId, userName: username, action: 'LOGOUT', resourceType: 'auth', description: (username || 'User') + ' logged out' + (reason !== 'manual' ? ' (' + reason.replace(/_/g, ' ') + ')' : ''), ip: req.ip });
  res.json({ message: 'Logged out' });
};




