const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMovements, addMovement, getSummary } = require('../controllers/inventoryController');

// All inventory routes require authentication
router.get('/summary', auth, getSummary);
router.get('/:productId/movements', auth, getMovements);
router.post('/:productId/movements', auth, addMovement);

module.exports = router;
