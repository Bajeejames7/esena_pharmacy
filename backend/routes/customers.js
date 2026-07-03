const express = require('express');
const router = express.Router();
const { firebaseAuth } = require('../middleware/firebaseAuth');
const auth = require('../middleware/auth'); // existing admin JWT middleware
const {
  upsertCustomer,
  getProfile,
  updateProfile,
  getMyOrders,
  reorder,
  getMyPrescriptions,
  getAllCustomers
} = require('../controllers/customerController');

// ── Customer routes (Firebase auth) ───────────────────────────
router.post('/auth',          firebaseAuth, upsertCustomer);
router.get('/profile',        firebaseAuth, getProfile);
router.put('/profile',        firebaseAuth, updateProfile);
router.get('/orders',         firebaseAuth, getMyOrders);
router.post('/reorder/:orderId', firebaseAuth, reorder);
router.get('/prescriptions',  firebaseAuth, getMyPrescriptions);

// ── Admin route (existing JWT auth) ───────────────────────────
router.get('/admin/list',     auth, getAllCustomers);

module.exports = router;
