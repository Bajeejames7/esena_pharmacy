/**
 * Unit Tests for Contact Controller
 * Tests contact form submission and validation
 * 
 * Requirements tested:
 * - 16.4: Contact form submission
 * - 16.5: Field validation (name, email, phone, message)
 * - 16.6: Admin email notification
 * - 16.7: Customer confirmation email
 * - 16.8: Error handling
 */

// Mock database
const mockDb = {
  contacts: [],
  query: jest.fn((sql, params) => {
    // INSERT contact
    if (sql.includes("INSERT INTO contacts")) {
      const [name, email, phone, message] = params;
      const contact = { name, email, phone, message, created_at: new Date() };
      mockDb.contacts.push(contact);
      return Promise.resolve([{ insertId: mockDb.contacts.length }]);
    }
    
    return Promise.resolve([[]]);
  })
};

// Mock email transporter
const mockTransporter = {
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
};

// Mock the modules
jest.mock("../config/db", () => mockDb);
jest.mock("../config/mail", () => mockTransporter);

const { createContact } = require("./contactController");

describe("Contact Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    // Reset mock database
    mockDb.contacts = [];
    mockDb.query.mockClear();
    mockTransporter.sendMail.mockClear();
    
    // Setup mock request and response
    req = {
      body: {}
    };
    
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe("createContact", () => {
    const validContactData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      message: "I need help with my prescription."
    };

    test("should create contact with valid data", async () => {
      req.body = validContactData;

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Message sent successfully"
        })
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(2); // Admin + Customer confirmation
      expect(mockDb.contacts.length).toBe(1);
    });

    test("should reject contact without name", async () => {
      req.body = { ...validContactData, name: "" };

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Validation failed",
          errors: expect.arrayContaining([
            expect.stringContaining("Name is required")
          ])
        })
      );
      expect(mockDb.contacts.length).toBe(0);
    });

    test("should reject contact without email", async () => {
      req.body = { ...validContactData, email: "" };

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Email is required")
          ])
        })
      );
    });

    test("should reject contact with invalid email format", async () => {
      req.body = { ...validContactData, email: "invalid-email" };

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Invalid email format")
          ])
        })
      );
    });

    test("should reject contact without phone", async () => {
      req.body = { ...validContactData, phone: "" };

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Phone is required")
          ])
        })
      );
    });

    test("should reject contact with invalid phone length", async () => {
      req.body = { ...validContactData, phone: "123" };

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Phone must be between 10 and 20 characters")
          ])
        })
      );
    });

    test("should reject contact without message", async () => {
      req.body = { ...validContactData, message: "" };

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Message is required")
          ])
        })
      );
    });

    test("should reject contact with name exceeding 255 characters", async () => {
      req.body = { ...validContactData, name: "a".repeat(256) };

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Name must not exceed 255 characters")
          ])
        })
      );
    });

    test("should send admin notification email with correct content", async () => {
      req.body = validContactData;

      await createContact(req, res);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: `New Contact Message from ${validContactData.name}`,
          html: expect.stringContaining(validContactData.name)
        })
      );
    });

    test("should send customer confirmation email", async () => {
      req.body = validContactData;

      await createContact(req, res);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: validContactData.email,
          subject: "Thank you for contacting Esena Pharmacy"
        })
      );
    });

    test("should handle email sending failure gracefully", async () => {
      req.body = validContactData;
      mockTransporter.sendMail.mockRejectedValueOnce(new Error("SMTP Error"));

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          warning: "Email notification failed"
        })
      );
      expect(mockDb.contacts.length).toBe(1); // Contact should still be saved
    });

    test("should handle multiple validation errors", async () => {
      req.body = {
        name: "",
        email: "invalid-email",
        phone: "123",
        message: ""
      };

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Validation failed",
          errors: expect.arrayContaining([
            expect.stringContaining("Name is required"),
            expect.stringContaining("Invalid email format"),
            expect.stringContaining("Phone must be between 10 and 20 characters"),
            expect.stringContaining("Message is required")
          ])
        })
      );
    });

    test("should format message with line breaks in emails", async () => {
      const messageWithLineBreaks = "Line 1\nLine 2\nLine 3";
      req.body = { ...validContactData, message: messageWithLineBreaks };

      await createContact(req, res);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining("Line 1<br>Line 2<br>Line 3")
        })
      );
    });

    test("should handle database error", async () => {
      req.body = validContactData;
      mockDb.query.mockRejectedValueOnce(new Error("Database connection failed"));

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Server error"
        })
      );
    });
  });
});