const request = require('supertest');
const express = require('express');
const { 
  generalLimiter, 
  authLimiter, 
  helmetConfig, 
  sanitizeInput,
  validateFileUpload,
  requestSizeLimit,
  securityHeaders 
} = require('./security');

describe('Security Middleware Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Security Headers', () => {
    test('should add security headers', async () => {
      app.use(securityHeaders);
      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      const response = await request(app).get('/test');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    test('should remove X-Powered-By header', async () => {
      app.use(securityHeaders);
      app.get('/test', (req, res) => {
        res.json({ message: 'test' });
      });

      const response = await request(app).get('/test');
      
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize and validate input', async () => {
      app.use(sanitizeInput);
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({
          name: '  Test Name  ',
          email: 'TEST@EXAMPLE.COM',
          price: '10.99',
          stock: '5'
        });

      expect(response.status).toBe(200);
      expect(response.body.body.name).toBe('Test Name');
      expect(response.body.body.email).toBe('test@example.com');
      expect(response.body.body.price).toBe(10.99);
      expect(response.body.body.stock).toBe(5);
    });

    test('should reject invalid input', async () => {
      app.use(sanitizeInput);
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({
          price: 'invalid',
          stock: -1
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid input data');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('Request Size Limit', () => {
    test('should allow normal sized requests', async () => {
      app.use(requestSizeLimit);
      app.post('/test', (req, res) => {
        res.json({ message: 'success' });
      });

      const response = await request(app)
        .post('/test')
        .send({ data: 'normal size data' });

      expect(response.status).toBe(200);
    });
  });

  describe('File Upload Validation', () => {
    test('should pass when no files are uploaded', async () => {
      app.use(validateFileUpload);
      app.post('/test', (req, res) => {
        res.json({ message: 'success' });
      });

      const response = await request(app)
        .post('/test')
        .send({ data: 'test' });

      expect(response.status).toBe(200);
    });

    test('should validate file types', async () => {
      const mockFile = {
        mimetype: 'text/plain',
        size: 1000
      };

      app.use((req, res, next) => {
        req.file = mockFile;
        next();
      });
      app.use(validateFileUpload);
      app.post('/test', (req, res) => {
        res.json({ message: 'success' });
      });

      const response = await request(app).post('/test');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid file type');
    });

    test('should allow valid image files', async () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 1000
      };

      app.use((req, res, next) => {
        req.file = mockFile;
        next();
      });
      app.use(validateFileUpload);
      app.post('/test', (req, res) => {
        res.json({ message: 'success' });
      });

      const response = await request(app).post('/test');

      expect(response.status).toBe(200);
    });

    test('should reject oversized files', async () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024 // 10MB
      };

      app.use((req, res, next) => {
        req.file = mockFile;
        next();
      });
      app.use(validateFileUpload);
      app.post('/test', (req, res) => {
        res.json({ message: 'success' });
      });

      const response = await request(app).post('/test');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('File too large');
    });
  });
});