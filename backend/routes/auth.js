const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  login,
  logout,
  setupPassword,
  requestPasswordReset,
  verifyOTP,
  confirmPasswordReset,
  updateProfile,
  setup2FA,
  confirm2FA,
  disable2FA
} = require('../controllers/authController');

router.post('/login', login);
router.post('/logout', auth, logout);
router.post('/setup-password', setupPassword);
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', confirmPasswordReset);

// Protected routes (require auth token)
router.put('/profile', auth, updateProfile);
router.post('/2fa/setup', auth, setup2FA);
router.post('/2fa/confirm', auth, confirm2FA);
router.post('/2fa/disable', auth, disable2FA);

module.exports = router;
