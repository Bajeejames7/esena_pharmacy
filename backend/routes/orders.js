const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createOrder,
  getOrderByToken,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

// Public routes
router.post("/", createOrder); // POST /api/orders (Req 5.2)

// Protected routes (require JWT authentication)
router.get("/", auth, getAllOrders); // GET /api/orders (Req 7.1)
router.put("/:id/status", auth, updateOrderStatus); // PUT /api/orders/:id/status (Req 7.1)

// Public routes (must come after protected routes to avoid conflicts)
router.get("/:token", getOrderByToken); // GET /api/orders/:token (Req 6.1)

module.exports = router;
