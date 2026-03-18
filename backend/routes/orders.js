const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  updateShippingCost,
  createOrder,
  cancelOrder,
  cancelOrderByToken,
  getOrderById,
  getOrderByToken,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

// Specific static-segment routes first (avoid param shadowing)
router.post("/cancel/:token", cancelOrderByToken); // customer self-service cancel (public)

// Protected routes (require JWT authentication)
router.get("/", auth, getAllOrders);
router.get("/:id/details", auth, getOrderById);
router.put("/:id/status", auth, updateOrderStatus);
router.post("/:id/cancel", auth, cancelOrder); // admin cancel by order ID

// General public routes last
router.post("/", createOrder);
router.put("/:id/shipping", auth, updateShippingCost);
router.get("/:token", getOrderByToken);

module.exports = router;
