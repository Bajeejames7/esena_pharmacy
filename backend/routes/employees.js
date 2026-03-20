const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createEmployee, getEmployees, updateEmployee, deleteEmployee, resendOTP, getActivityLog
} = require('../controllers/employeeController');

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.get('/', auth, adminOnly, getEmployees);
router.post('/', auth, adminOnly, createEmployee);
router.put('/:id', auth, adminOnly, updateEmployee);
router.delete('/:id', auth, adminOnly, deleteEmployee);
router.post('/:id/resend-otp', auth, adminOnly, resendOTP);
router.get('/activity-log', auth, getActivityLog);

module.exports = router;
