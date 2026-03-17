const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { productAudit } = require("../middleware/audit");
const { sanitizeInput } = require("../middleware/security");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// Public routes (Requirements 3.2, 12.1)
// GET /api/products - Get all products with optional category filtering
router.get("/", getAllProducts);

// GET /api/products/:id - Get product by ID
router.get("/:id", getProductById);

// Protected routes (require JWT authentication)
// POST /api/products - Create new product with image/video upload (Requirements 3.2, 12.1)
router.post("/", auth, upload, sanitizeInput, productAudit, createProduct);

// PUT /api/products/:id - Update product (Requirements 12.1)
router.put("/:id", auth, upload, sanitizeInput, productAudit, updateProduct);

// DELETE /api/products/:id - Delete product (Requirements 12.1)
router.delete("/:id", auth, productAudit, deleteProduct);

module.exports = router;
