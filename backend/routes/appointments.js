const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createAppointment,
  getAppointmentByToken,
  getAllAppointments,
  updateAppointmentStatus
} = require("../controllers/appointmentController");

// Public routes
router.post("/", createAppointment); // POST /api/appointments (Req 8.6)

// Protected routes (require JWT authentication)
router.get("/", auth, getAllAppointments); // GET /api/appointments (admin only)
router.put("/:id/status", auth, updateAppointmentStatus); // PUT /api/appointments/:id/status (admin only)

// Public routes (must come after protected routes to avoid conflicts)
router.get("/:token", getAppointmentByToken); // GET /api/appointments/:token (Req 9.1)

module.exports = router;
