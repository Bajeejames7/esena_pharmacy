const fc = require("fast-check");

/**
 * Unit and Property-Based Tests for Product Controller
 * Tests CRUD operations, validation, and file upload handling
 * 
 * Requirements tested:
 * - 3.2: Product retrieval with category filtering
 * - 12.1: Product CRUD operations
 * - 12.2: Category validation
 * - 12.3: Price validation
 * - 12.4: Stock validation
 * - 12.10: Product creation with file uploads
 * - 12.11: Product updates
 * - 12.12: Product deletion
 */

// Mock database
const mockDb = {
  products: [],
  nextId: 1,
  query: jest.fn((sql, params) => {
    // SELECT all products
    if (sql.includes("SELECT * FROM products") && !sql.includes("WHERE id")) {
      if (sql.includes("WHERE category")) {
        const category = params[0];
        const filtered = mockDb.products.filter(p => p.category === category);
        return Promise.resolve([filtered]);
      }
      return Promise.resolve([mockDb.products]);
    }
    
    // SELECT product by ID
    if (sql.includes("SELECT * FROM products WHERE id")) {
      const id = params[0];
      const product = mockDb.products.find(p => p.id === parseInt(id));
      return Promise.resolve([product ? [product] : []]);
    }
    
    // SELECT for existence check
    if (sql.includes("SELECT id FROM products WHERE id")) {
      const id = params[0];
      const product = mockDb.products.find(p => p.id === parseInt(id));
      return Promise.resolve([product ? [{ id: product.id }] : []]);
    }
    
    // INSERT product
    if (sql.includes("INSERT INTO products")) {
      const [name, category, price, description, image, video, stock] = params;
      const id = mockDb.nextId++;
      const product = { id, name, category, price, description, image, video, stock };
      mockDb.products.push(product);
      return Promise.resolve([{ insertId: id }]);
    }
    
    // UPDATE product
    if (sql.includes("UPDATE products")) {
      const id = params[params.length - 1];
      const productIndex = mockDb.products.findIndex(p => p.id === parseInt(id));
      if (productIndex !== -1) {
        // Update based on number of params
        if (params.length === 6) {
          // Basic update without files
          const [name, category, price, description, stock] = params;
          mockDb.products[productIndex] = {
            ...mockDb.products[productIndex],
            name, category, price, description, stock
          };
        } else {
          // Update with files
          const name = params[0];
          const category = params[1];
          const price = params[2];
          const description = params[3];
          const stock = params[4];
          mockDb.products[productIndex] = {
            ...mockDb.products[productIndex],
            name, category, price, description, stock
          };
        }
      }
      return Promise.resolve([{ affectedRows: productIndex !== -1 ? 1 : 0 }]);
    }
    
    // DELETE product
    if (sql.includes("DELETE FROM products")) {
      const id = params[0];
      const initialLength = mockDb.products.length;
      mockDb.products = mockDb.products.filter(p => p.id !== parseInt(id));
      return Promise.resolve([{ affectedRows: initialLength - mockDb.products.length }]);
    }
    
    return Promise.resolve([[]]);
  })
};

// Mock the db module
jest.mock("../config/db", () => mockDb);

// Mock the logger module
jest.mock("../utils/logger", () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    audit: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("./productController");

describe("Product Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    // Reset mock database
    mockDb.products = [];
    mockDb.nextId = 1;
    mockDb.query.mockClear();
    
    // Setup mock request and response
    req = {
      query: {},
      params: {},
      body: {},
      files: {}
    };
    
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe("getAllProducts", () => {
    test("should return all products when no category filter", async () => {
      // Add test products
      mockDb.products = [
        { id: 1, name: "Product 1", category: "OTC", price: 10.99, stock: 5 },
        { id: 2, name: "Product 2", category: "Prescription", price: 25.50, stock: 3 }
      ];

      await getAllProducts(req, res);

      expect(res.json).toHaveBeenCalledWith(mockDb.products);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should filter products by category", async () => {
      mockDb.products = [
        { id: 1, name: "Product 1", category: "OTC", price: 10.99, stock: 5 },
        { id: 2, name: "Product 2", category: "Prescription", price: 25.50, stock: 3 }
      ];

      req.query.category = "OTC";
      await getAllProducts(req, res);

      expect(res.json).toHaveBeenCalledWith([mockDb.products[0]]);
    });

    test("should return 400 for invalid category", async () => {
      req.query.category = "InvalidCategory";
      await getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid category"
        })
      );
    });
  });

  describe("getProductById", () => {
    test("should return product when found", async () => {
      const product = { id: 1, name: "Test Product", category: "OTC", price: 15.99, stock: 10 };
      mockDb.products = [product];

      req.params.id = "1";
      await getProductById(req, res);

      expect(res.json).toHaveBeenCalledWith(product);
    });

    test("should return 404 when product not found", async () => {
      req.params.id = "999";
      await getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });
  });

  describe("createProduct - Validation", () => {
    test("should reject product without name", async () => {
      req.body = {
        category: "OTC",
        price: 10.99,
        stock: 5
      };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Validation failed",
          errors: expect.arrayContaining([
            expect.stringContaining("name is required")
          ])
        })
      );
    });

    test("should reject product without category", async () => {
      req.body = {
        name: "Test Product",
        price: 10.99,
        stock: 5
      };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("category is required")
          ])
        })
      );
    });

    test("should reject product with invalid category", async () => {
      req.body = {
        name: "Test Product",
        category: "InvalidCategory",
        price: 10.99,
        stock: 5
      };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Category must be one of")
          ])
        })
      );
    });

    test("should reject product with negative price", async () => {
      req.body = {
        name: "Test Product",
        category: "OTC",
        price: -5.99,
        stock: 5
      };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Price must be a positive number")
          ])
        })
      );
    });

    test("should reject product with negative stock", async () => {
      req.body = {
        name: "Test Product",
        category: "OTC",
        price: 10.99,
        stock: -1
      };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Stock must be a non-negative integer")
          ])
        })
      );
    });

    test("should create product with valid data", async () => {
      req.body = {
        name: "Test Product",
        category: "OTC",
        price: 10.99,
        stock: 5,
        description: "Test description"
      };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Number),
          message: "Product created successfully"
        })
      );
    });
  });

  describe("updateProduct", () => {
    test("should update existing product", async () => {
      mockDb.products = [
        { id: 1, name: "Old Name", category: "OTC", price: 10.99, stock: 5 }
      ];

      req.params.id = "1";
      req.body = {
        name: "New Name",
        category: "Prescription",
        price: 15.99,
        stock: 10
      };

      await updateProduct(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Product updated successfully"
        })
      );
    });

    test("should return 404 for non-existent product", async () => {
      req.params.id = "999";
      req.body = {
        name: "Test",
        category: "OTC",
        price: 10.99,
        stock: 5
      };

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });
  });

  describe("deleteProduct", () => {
    test("should delete existing product", async () => {
      mockDb.products = [
        { id: 1, name: "Test Product", category: "OTC", price: 10.99, stock: 5 }
      ];

      req.params.id = "1";
      await deleteProduct(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Product deleted successfully"
        })
      );
      expect(mockDb.products.length).toBe(0);
    });

    test("should return 404 for non-existent product", async () => {
      req.params.id = "999";
      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });
  });
});

describe("Product Controller Property-Based Tests", () => {
  let req, res;

  beforeEach(() => {
    mockDb.products = [];
    mockDb.nextId = 1;
    mockDb.query.mockClear();
    
    req = {
      query: {},
      params: {},
      body: {},
      files: {}
    };
    
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  test("Property: Valid products are always created successfully", async () => {
    const validCategories = ['Prescription', 'OTC', 'Chronic', 'Supplements', 'PersonalCare'];
    
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 255 }).filter(s => s.trim().length > 0), // Ensure non-empty after trim
        fc.constantFrom(...validCategories),
        fc.float({ min: Math.fround(0.01), max: Math.fround(9999.99) }).filter(n => !isNaN(n) && isFinite(n)), // Filter out NaN and Infinity
        fc.integer({ min: 0, max: 10000 }),
        async (name, category, price, stock) => {
          req.body = { name, category, price, stock };
          await createProduct(req, res);

          expect(res.status).toHaveBeenCalledWith(201);
          expect(mockDb.products.length).toBeGreaterThan(0);
          
          // Reset for next iteration
          mockDb.products = [];
          mockDb.nextId = 1;
          res.status.mockClear();
          res.json.mockClear();
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  test("Property: Invalid categories are always rejected", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => 
          !['Prescription', 'OTC', 'Chronic', 'Supplements', 'PersonalCare'].includes(s)
        ),
        async (invalidCategory) => {
          req.body = {
            name: "Test Product",
            category: invalidCategory,
            price: 10.99,
            stock: 5
          };
          
          await createProduct(req, res);

          expect(res.status).toHaveBeenCalledWith(400);
          
          // Reset for next iteration
          res.status.mockClear();
          res.json.mockClear();
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  test("Property: Negative prices are always rejected", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: Math.fround(-10000), max: Math.fround(-0.01) }),
        async (negativePrice) => {
          req.body = {
            name: "Test Product",
            category: "OTC",
            price: negativePrice,
            stock: 5
          };
          
          await createProduct(req, res);

          expect(res.status).toHaveBeenCalledWith(400);
          
          // Reset for next iteration
          res.status.mockClear();
          res.json.mockClear();
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  test("Property: Negative stock values are always rejected", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: -1000, max: -1 }),
        async (negativeStock) => {
          req.body = {
            name: "Test Product",
            category: "OTC",
            price: 10.99,
            stock: negativeStock
          };
          
          await createProduct(req, res);

          expect(res.status).toHaveBeenCalledWith(400);
          
          // Reset for next iteration
          res.status.mockClear();
          res.json.mockClear();
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  test("Property: Category filtering returns only matching products", async () => {
    const validCategories = ['Prescription', 'OTC', 'Chronic', 'Supplements', 'PersonalCare'];
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...validCategories),
        async (filterCategory) => {
          // Add products with different categories
          mockDb.products = validCategories.map((cat, idx) => ({
            id: idx + 1,
            name: `Product ${idx + 1}`,
            category: cat,
            price: 10.99,
            stock: 5
          }));

          req.query.category = filterCategory;
          await getAllProducts(req, res);

          const returnedProducts = res.json.mock.calls[0][0];
          const allMatchCategory = returnedProducts.every(p => p.category === filterCategory);
          
          expect(allMatchCategory).toBe(true);
          
          // Reset for next iteration
          req.query = {};
          res.json.mockClear();
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});
