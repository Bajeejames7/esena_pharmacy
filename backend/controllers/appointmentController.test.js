/**
 * Unit Tests for Appointment Controller
 * Tests appointment booking, tracking, and status management
 * 
 * Requirements tested:
 * - 8.6: Appointment creation with validation
 * - 8.7: Email and phone validation
 * - 8.8: Service validation
 * - 8.9: Date validation and token generation
 * - 8.10: Customer email notifications
 * - 8.11: Admin email notifications
 * - 9.1: Appointment tracking by token
 * - 9.2: Database query for appointment
 * - 9.3: Return appointment details
 * - 9.4: Handle not found cases
 * - 9.5: Status updates
 * - 9.6: Confirmation email notifications
 * - 9.7: Completion email notifications
 */

// Mock database
const mockDb = {
  appointments: [],
  nextId: 1,
  query: jest.fn((sql, params) => {
    // SELECT appointment by token
    if (sql.includes("SELECT * FROM appointments WHERE token")) {
      const token = params[0];
      const appointment = mockDb.appointments.find(a => a.token === token);
      return Promise.resolve([appointment ? [appointment] : []]);
    }
    
    // SELECT appointment by ID
    if (sql.includes("SELECT * FROM appointments WHERE id")) {
      const id = params[0];
      const appointment = mockDb.appointments.find(a => a.id === parseInt(id));
      return Promise.resolve([appointment ? [appointment] : []]);
    }
    
    // SELECT all appointments
    if (sql.includes("SELECT * FROM appointments") && sql.includes("ORDER BY")) {
      return Promise.resolve([mockDb.appointments]);
    }
    
    // INSERT appointment
    if (sql.includes("INSERT INTO appointments")) {
      const [name, email, phone, service, date, message, token] = params;
      const id = mockDb.nextId++;
      const appointment = { id, name, email, phone, service, date, message, token, status: 'pending' };
      mockDb.appointments.push(appointment);
      return Promise.resolve([{ insertId: id }]);
    }
    
    // UPDATE appointment status
    if (sql.includes("UPDATE appointments SET status")) {
      const [status, id] = params;
      const appointmentIndex = mockDb.appointments.findIndex(a => a.id === parseInt(id));
      if (appointmentIndex !== -1) {
        mockDb.appointments[appointmentIndex].status = status;
      }
      return Promise.resolve([{ affectedRows: appointmentIndex !== -1 ? 1 : 0 }]);
    }
    
    return Promise.resolve([[]]);
  })
};

// Mock email transporter
const mockTransporter = {
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
};

// Mock token generator
const mockTokenGenerator = {
  generateUniqueToken: jest.fn().mockResolvedValue('TEST-TOKEN-12345')
};

// Mock the modules
jest.mock("../config/db", () => mockDb);
jest.mock("../config/mail", () => mockTransporter);
jest.mock("../utils/tokenGenerator", () => mockTokenGenerator);

const {
  createAppointment,
  getAppointmentByToken,
  getAllAppointments,
  updateAppointmentStatus
} = require("./appointmentController");

describe("Appointment Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    // Reset mock database
    mockDb.appointments = [];
    mockDb.nextId = 1;
    mockDb.query.mockClear();
    mockTransporter.sendMail.mockClear();
    mockTokenGenerator.generateUniqueToken.mockClear();
    
    // Setup mock request and response
    req = {
      body: {},
      params: {}
    };
    
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe("createAppointment", () => {
    const validAppointmentData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      service: "Dermatology",
      date: "2026-12-31", // Use a date that's definitely in the future
      message: "Need consultation"
    };

    test("should create appointment with valid data", async () => {
      req.body = validAppointmentData;

      await createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Number),
          token: "TEST-TOKEN-12345",
          message: "Appointment booked successfully"
        })
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(2); // Customer + Admin
    });

    test("should reject appointment without name", async () => {
      req.body = { ...validAppointmentData, name: "" };

      await createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Validation failed",
          errors: expect.arrayContaining([
            expect.stringContaining("Name is required")
          ])
        })
      );
    });

    test("should reject appointment with invalid email", async () => {
      req.body = { ...validAppointmentData, email: "invalid-email" };

      await createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Invalid email format")
          ])
        })
      );
    });

    test("should reject appointment with invalid service", async () => {
      req.body = { ...validAppointmentData, service: "InvalidService" };

      await createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Service must be one of")
          ])
        })
      );
    });

    test("should reject appointment with past date", async () => {
      req.body = { ...validAppointmentData, date: "2020-01-01" };

      await createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining("Appointment date must be in the future")
          ])
        })
      );
    });

    test("should handle email sending failure gracefully", async () => {
      req.body = validAppointmentData;
      mockTransporter.sendMail.mockRejectedValueOnce(new Error("SMTP Error"));

      await createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          warning: "Email notification failed"
        })
      );
    });
  });

  describe("getAppointmentByToken", () => {
    test("should return appointment when found", async () => {
      const appointment = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        service: "Dermatology",
        token: "TEST-TOKEN-12345",
        status: "pending"
      };
      mockDb.appointments = [appointment];

      req.params.token = "TEST-TOKEN-12345";
      await getAppointmentByToken(req, res);

      expect(res.json).toHaveBeenCalledWith(appointment);
    });

    test("should return 404 when appointment not found", async () => {
      req.params.token = "NONEXISTENT-TOKEN";
      await getAppointmentByToken(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Appointment not found" });
    });
  });

  describe("getAllAppointments", () => {
    test("should return all appointments", async () => {
      const appointments = [
        { id: 1, name: "John Doe", service: "Dermatology", status: "pending" },
        { id: 2, name: "Jane Smith", service: "LabTest", status: "confirmed" }
      ];
      mockDb.appointments = appointments;

      await getAllAppointments(req, res);

      expect(res.json).toHaveBeenCalledWith(appointments);
    });

    test("should return empty array when no appointments", async () => {
      await getAllAppointments(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe("updateAppointmentStatus", () => {
    beforeEach(() => {
      mockDb.appointments = [{
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        service: "Dermatology",
        date: "2026-12-31",
        token: "TEST-TOKEN-12345",
        status: "pending"
      }];
    });

    test("should update status to confirmed and send email", async () => {
      req.params.id = "1";
      req.body.status = "confirmed";

      await updateAppointmentStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Appointment status updated successfully"
        })
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Appointment Confirmed - Esena Pharmacy"
        })
      );
    });

    test("should update status to completed and send email", async () => {
      req.params.id = "1";
      req.body.status = "completed";

      await updateAppointmentStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Appointment status updated successfully"
        })
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Appointment Completed - Esena Pharmacy"
        })
      );
    });

    test("should reject invalid status", async () => {
      req.params.id = "1";
      req.body.status = "invalid-status";

      await updateAppointmentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Invalid status")
        })
      );
    });

    test("should return 404 for non-existent appointment", async () => {
      req.params.id = "999";
      req.body.status = "confirmed";

      await updateAppointmentStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Appointment not found" });
    });

    test("should handle email sending failure gracefully", async () => {
      req.params.id = "1";
      req.body.status = "confirmed";
      mockTransporter.sendMail.mockRejectedValueOnce(new Error("SMTP Error"));

      await updateAppointmentStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          warning: "Email notification failed"
        })
      );
    });
  });
});