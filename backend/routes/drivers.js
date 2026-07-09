/**
 * Driver Routes
 * Handles driver authentication and delivery management
 */

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const driverAuth = require('../middleware/driverAuth');
const auth = require('../middleware/auth');
const proofUpload = require('../middleware/proofUpload');

// ──────────────────────────────────────────────────────────────
// PUBLIC ROUTES (Driver authentication)
// ──────────────────────────────────────────────────────────────
router.post('/login', driverController.login);

// ──────────────────────────────────────────────────────────────
// DRIVER PROTECTED ROUTES
// ──────────────────────────────────────────────────────────────
router.get('/deliveries', driverAuth, driverController.getMyDeliveries);
router.put('/deliveries/:id/status', driverAuth, driverController.updateDeliveryStatus);
router.post('/deliveries/:id/proof', driverAuth, proofUpload.single('proof'), driverController.uploadProof);

// ──────────────────────────────────────────────────────────────
// ADMIN ROUTES (Driver management)
// ──────────────────────────────────────────────────────────────
router.post('/admin/register', auth, driverController.registerDriver);
router.get('/admin/list', auth, driverController.getAllDrivers);
router.put('/admin/:id', auth, driverController.updateDriver);
router.get('/admin/deliveries', auth, driverController.getAllDeliveries);
router.post('/admin/deliveries/assign', auth, driverController.assignDelivery);
router.post('/admin/deliveries/:id/reassign', auth, driverController.reassignDelivery);

module.exports = router;
