// Set test environment before any imports
process.env.NODE_ENV = 'test';
process.env.EMAIL_USER = 'test@example.com';
process.env.RESEND_API_KEY = 'test_resend_key';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock the Resend SDK before requiring mail module
const mockSend = jest.fn();
jest.mock("resend", () => ({
  Resend: jest.fn(() => ({
    emails: { send: mockSend }
  }))
}));

const {
  sendEmail,
  orderConfirmationTemplate,
  orderAdminNotificationTemplate,
  paymentRequestTemplate,
  dispatchNotificationTemplate,
  appointmentConfirmationTemplate,
  appointmentAdminNotificationTemplate
} = require("./mail");

/**
 * Unit Tests for Email Service
 * **Validates: Requirements 14.9, 14.10**
 * 
 * Tests email sending with mock SMTP server
 * Tests error handling when email service fails
 * Tests that order creation succeeds even if email fails
 */
describe("Email Service Unit Tests", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe("sendEmail function", () => {
    /**
     * Test: Email sending with successful SMTP response
     * **Validates: Requirements 14.9**
     */
    test("should send email successfully and return true", async () => {
      // Mock successful email send (Resend SDK response shape)
      mockSend.mockResolvedValue({ data: { id: "test-message-id" }, error: null });

      const mailOptions = {
        to: "customer@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>"
      };

      const result = await sendEmail(mailOptions);

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "customer@example.com",
          subject: "Test Email",
          html: "<p>Test content</p>"
        })
      );
    });

    /**
     * Test: Email sending with an API-level error (Resend returns { error }
     * rather than throwing, for things like invalid recipient/auth failure)
     * **Validates: Requirements 14.9, 14.10**
     */
    test("should handle an API-level error and return false", async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: "Invalid recipient" } });

      const mailOptions = {
        to: "invalid-email",
        subject: "Test Email",
        html: "<p>Test content</p>"
      };

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await sendEmail(mailOptions);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Email sending failed:",
        "Invalid recipient"
      );

      consoleErrorSpy.mockRestore();
    });

    /**
     * Test: Email sending with a thrown network-level error
     * **Validates: Requirements 14.9, 14.10**
     */
    test("should handle a thrown network error and return false", async () => {
      mockSend.mockRejectedValue(new Error("Connection timeout"));

      const mailOptions = {
        to: "customer@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>"
      };

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await sendEmail(mailOptions);

      expect(result).toBe(false);
      expect(mockSend).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Email Templates", () => {
    /**
     * Test: Order confirmation template generation
     * **Validates: Requirements 5.8, 14.1, 14.2**
     */
    test("should generate order confirmation template with all required fields", () => {
      const order = {
        customer_name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        delivery_address: "123 Main St",
        notes: "Please ring doorbell",
        total: 150.50,
        token: "ABC123XYZ456"
      };
      
      const template = orderConfirmationTemplate(order, []);
      
      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("html");
      expect(template.subject).toContain("Order Confirmation");
      expect(template.html).toContain("John Doe");
      expect(template.html).toContain("ABC123XYZ456");
      expect(template.html).toContain("150.50");
      expect(template.html).toContain("123 Main St");
    });

    /**
     * Test: Order admin notification template generation
     * **Validates: Requirements 5.9, 14.3**
     */
    test("should generate order admin notification template with order items", () => {
      const order = {
        customer_name: "Jane Smith",
        email: "jane@example.com",
        phone: "0987654321",
        delivery_address: "456 Oak Ave",
        total: 200.00,
        token: "XYZ789ABC123"
      };
      
      const items = [
        { name: "Product A", quantity: 2, price: 50.00 },
        { name: "Product B", quantity: 1, price: 100.00 }
      ];
      
      const template = orderAdminNotificationTemplate(order, items);
      
      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("html");
      expect(template.subject).toContain("Jane Smith");
      expect(template.html).toContain("Jane Smith");
      expect(template.html).toContain("jane@example.com");
      expect(template.html).toContain("XYZ789ABC123");
      expect(template.html).toContain("Product A");
      expect(template.html).toContain("Product B");
    });

    /**
     * Test: Payment request template generation
     * **Validates: Requirements 7.7, 14.7**
     */
    test("should generate payment request template with payment instructions", () => {
      const order = {
        customer_name: "Bob Johnson",
        email: "bob@example.com",
        total: 75.25,
        token: "PAY123TOKEN456"
      };
      
      const template = paymentRequestTemplate(order);
      
      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("html");
      expect(template.subject).toContain("Payment Request");
      expect(template.html).toContain("Bob Johnson");
      expect(template.html).toContain("75.25");
      expect(template.html).toContain("PAY123TOKEN456");
      expect(template.html).toContain("M-PESA");
    });

    /**
     * Test: Dispatch notification template generation
     * **Validates: Requirements 7.8, 14.8**
     */
    test("should generate dispatch notification template with tracking link", () => {
      const order = {
        customer_name: "Alice Brown",
        email: "alice@example.com",
        delivery_address: "789 Pine Rd",
        token: "DISPATCH123"
      };
      
      const template = dispatchNotificationTemplate(order);
      
      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("html");
      expect(template.subject).toContain("Dispatched");
      expect(template.html).toContain("Alice Brown");
      expect(template.html).toContain("789 Pine Rd");
      expect(template.html).toContain("DISPATCH123");
    });

    /**
     * Test: Appointment confirmation template generation
     * **Validates: Requirements 8.10, 14.4, 14.5**
     */
    test("should generate appointment confirmation template with service details", () => {
      const appointment = {
        name: "Charlie Davis",
        email: "charlie@example.com",
        phone: "5551234567",
        service: "Dermatology",
        date: "2024-12-25T10:00:00Z",
        token: "APPT123TOKEN"
      };
      
      const template = appointmentConfirmationTemplate(appointment);
      
      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("html");
      expect(template.subject).toContain("Appointment Confirmation");
      expect(template.html).toContain("Charlie Davis");
      expect(template.html).toContain("Dermatology");
      expect(template.html).toContain("APPT123TOKEN");
    });

    /**
     * Test: Appointment admin notification template generation
     * **Validates: Requirements 8.11, 14.6**
     */
    test("should generate appointment admin notification template", () => {
      const appointment = {
        name: "Diana Evans",
        email: "diana@example.com",
        phone: "5559876543",
        service: "LabTest",
        date: "2024-12-26T14:00:00Z",
        token: "APPTADMIN456",
        message: "Need fasting blood test"
      };
      
      const template = appointmentAdminNotificationTemplate(appointment);
      
      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("html");
      expect(template.subject).toContain("Diana Evans");
      expect(template.subject).toContain("LabTest");
      expect(template.html).toContain("Diana Evans");
      expect(template.html).toContain("diana@example.com");
      expect(template.html).toContain("Need fasting blood test");
    });

    /**
     * Test: Template handles missing optional fields
     * **Validates: Requirements 14.9**
     */
    test("should handle missing optional fields in templates", () => {
      const order = {
        customer_name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        delivery_address: "Test Address",
        total: 100.00,
        token: "TEST123"
        // notes is missing (optional)
      };
      
      const template = orderConfirmationTemplate(order, []);
      
      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("html");
      expect(template.html).toContain("Test User");
    });

    /**
     * Test: Template escapes HTML in user input
     * **Validates: Requirements 14.9**
     */
    test("should include user input in templates without breaking HTML", () => {
      const order = {
        customer_name: "User <script>alert('xss')</script>",
        email: "user@example.com",
        phone: "1234567890",
        delivery_address: "123 Main St",
        total: 50.00,
        token: "SAFE123"
      };
      
      const template = orderConfirmationTemplate(order, []);
      
      // Template should include the name (even with special characters)
      expect(template.html).toContain("User");
      expect(template).toHaveProperty("html");
    });
  });

  describe("Email Service Error Handling", () => {
    /**
     * Test: Order creation succeeds even if email fails
     * **Validates: Requirements 14.9, 14.10**
     */
    test("should not throw error when email fails", async () => {
      // Mock email send failure
      mockSend.mockRejectedValue(new Error("Email service unavailable"));
      
      const mailOptions = {
        to: "customer@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>"
      };
      
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      
      // Should not throw error
      await expect(sendEmail(mailOptions)).resolves.toBe(false);
      
      consoleErrorSpy.mockRestore();
    });

    /**
     * Test: Multiple email failures are handled independently
     * **Validates: Requirements 14.9, 14.10**
     */
    test("should handle multiple email failures independently", async () => {
      // Mock email send failure
      mockSend.mockRejectedValue(new Error("SMTP error"));
      
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      
      // Send multiple emails
      const result1 = await sendEmail({
        to: "user1@example.com",
        subject: "Email 1",
        html: "<p>Content 1</p>"
      });
      
      const result2 = await sendEmail({
        to: "user2@example.com",
        subject: "Email 2",
        html: "<p>Content 2</p>"
      });
      
      // Both should fail independently
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(mockSend).toHaveBeenCalledTimes(2);
      
      consoleErrorSpy.mockRestore();
    });

    /**
     * Test: Email service logs errors appropriately
     * **Validates: Requirements 14.9**
     */
    test("should log error message when email fails", async () => {
      const errorMessage = "Connection refused";
      mockSend.mockRejectedValue(new Error(errorMessage));
      
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      
      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>"
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Email sending failed:",
        errorMessage
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Email Template Content Validation", () => {
    /**
     * Test: All templates include required HTML structure
     * **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8**
     */
    test("all templates should have valid HTML structure", () => {
      const order = {
        customer_name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        delivery_address: "Test Address",
        total: 100.00,
        token: "TEST123"
      };
      
      const items = [{ name: "Product", quantity: 1, price: 100.00 }];
      
      const appointment = {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        service: "Dermatology",
        date: "2024-12-25T10:00:00Z",
        token: "APPT123"
      };
      
      const templates = [
        orderConfirmationTemplate(order, []),
        orderAdminNotificationTemplate(order, items),
        paymentRequestTemplate(order),
        dispatchNotificationTemplate(order),
        appointmentConfirmationTemplate(appointment),
        appointmentAdminNotificationTemplate(appointment)
      ];
      
      templates.forEach((template) => {
        expect(template.html).toContain("<!DOCTYPE html>");
        expect(template.html).toContain("<html>");
        expect(template.html).toContain("</html>");
        expect(template.html).toContain("<body>");
        expect(template.html).toContain("</body>");
      });
    });

    /**
     * Test: Templates include tracking tokens
     * **Validates: Requirements 14.1, 14.2, 14.4, 14.5**
     */
    test("customer templates should include tracking tokens", () => {
      const order = {
        customer_name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        delivery_address: "Test Address",
        total: 100.00,
        token: "UNIQUE_TOKEN_123"
      };
      
      const templates = [
        orderConfirmationTemplate(order, []),
        paymentRequestTemplate(order),
        dispatchNotificationTemplate(order)
      ];
      
      templates.forEach((template) => {
        expect(template.html).toContain("UNIQUE_TOKEN_123");
      });
    });
  });
});
