const db = require("../config/db");
const { logger } = require("../utils/logger");

const { VALID_CATEGORIES } = require("../utils/categories");

// Validation helper
const validateProductData = (data) => {
  const errors = [];
  
  // Validate name (Requirement 12.1)
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Product name is required");
  } else if (data.name.length > 255) {
    errors.push("Product name must not exceed 255 characters");
  }
  
  // Validate category (Requirement 12.2)
  if (!data.category) {
    errors.push("Product category is required");
  } else if (!VALID_CATEGORIES.includes(data.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  // Validate price (Requirement 12.3)
  if (data.price === undefined || data.price === null) {
    errors.push("Product price is required");
  } else {
    const price = parseFloat(data.price);
    if (isNaN(price) || price <= 0) {
      errors.push("Price must be a positive number");
    }
  }
  
  // Validate stock (Requirement 12.4)
  if (data.stock === undefined || data.stock === null) {
    errors.push("Product stock is required");
  } else {
    const stock = parseInt(data.stock);
    if (isNaN(stock) || stock < 0 || !Number.isInteger(parseFloat(data.stock))) {
      errors.push("Stock must be a non-negative integer");
    }
  }
  
  return errors;
};

// Get all products with optional category filtering and pagination (Requirement 3.2)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, limit, offset, price_min, price_max } = req.query;

    const pageLimit = Math.min(parseInt(limit) || 12, 100);
    const pageOffset = parseInt(offset) || 0;

    const conditions = [];
    const params = [];

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: "Invalid category", validCategories: VALID_CATEGORIES });
      }
      conditions.push("category = ?");
      params.push(category);
    }

    if (search) {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (price_min !== undefined && price_min !== '') {
      const min = parseFloat(price_min);
      if (!isNaN(min)) { conditions.push("price >= ?"); params.push(min); }
    }

    if (price_max !== undefined && price_max !== '') {
      const max = parseFloat(price_max);
      if (!isNaN(max)) { conditions.push("price <= ?"); params.push(max); }
    }

    const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM products${where}`, params);
    const [products] = await db.query(
      `SELECT * FROM products${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageLimit, pageOffset]
    );

    res.json({ products, total, limit: pageLimit, offset: pageOffset });
  } catch (error) {
    console.error("Error fetching products:", error);
    logger.error("Database error in getAllProducts", error);
    res.status(500).json({
      message: "Database connection error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get product by ID (Requirement 12.1)
exports.getProductById = async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new product (Requirements 12.1, 12.2, 12.3, 12.4, 12.10)
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, description, stock } = req.body;
    
    // Validate product data
    const validationErrors = validateProductData({ name, category, price, stock });
    if (validationErrors.length > 0) {
      logger.warn('Product creation validation failed', {
        errors: validationErrors,
        userId: req.user?.userId,
        productData: { name, category, price, stock }
      });
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }
    
    // Get uploaded file paths (Requirement 12.10)
    const image = req.files?.image?.[0]?.filename || null;
    const video = req.files?.video?.[0]?.filename || null;
    
    // Insert product into database
    const [result] = await db.query(
      "INSERT INTO products (name, category, price, description, image, video, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, category, parseFloat(price), description || null, image, video, parseInt(stock)]
    );
    
    const newProduct = {
      id: result.insertId,
      name,
      category,
      price: parseFloat(price),
      description,
      image,
      video,
      stock: parseInt(stock)
    };
    
    // Log successful product creation
    logger.audit('PRODUCT_CREATED', {
      productId: result.insertId,
      productData: newProduct
    }, req);
    
    res.status(201).json({ 
      id: result.insertId, 
      message: "Product created successfully",
      product: newProduct
    });
  } catch (error) {
    logger.error('Error creating product', error, {
      userId: req.user?.userId,
      productData: req.body
    });
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update product (Requirements 12.11)
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, description, stock } = req.body;
    
    // Validate product data
    const validationErrors = validateProductData({ name, category, price, stock });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }
    
    // Check if product exists
    const [existing] = await db.query("SELECT id FROM products WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Handle file uploads if present
    const image = req.files?.image?.[0]?.filename;
    const video = req.files?.video?.[0]?.filename;
    
    // Build update query dynamically
    let updateQuery = "UPDATE products SET name = ?, category = ?, price = ?, description = ?, stock = ?";
    let params = [name, category, parseFloat(price), description || null, parseInt(stock)];
    
    if (image) {
      updateQuery += ", image = ?";
      params.push(image);
    }
    
    if (video) {
      updateQuery += ", video = ?";
      params.push(video);
    }
    
    updateQuery += " WHERE id = ?";
    params.push(req.params.id);
    
    await db.query(updateQuery, params);
    
    res.json({ 
      message: "Product updated successfully",
      productId: parseInt(req.params.id)
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete product (Requirements 12.12)
exports.deleteProduct = async (req, res) => {
  try {
    // Check if product exists
    const [existing] = await db.query("SELECT id FROM products WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Delete product
    await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    
    res.json({ 
      message: "Product deleted successfully",
      productId: parseInt(req.params.id)
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
