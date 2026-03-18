const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createAppointment,
  getAppointmentByToken,
  getAllAppointments,
  updateAppointmentStatus,
  rescheduleAppointment
} = require("../controllers/appointmentController");

// Public routes
router.post("/", createAppointment);

// Protected routes (require JWT authentication)
router.get("/", auth, getAllAppointments);
router.put("/:id/status", auth, updateAppointmentStatus);
router.put("/:id/reschedule", auth, rescheduleAppointment);

// Public routes (must come after protected routes to avoid conflicts)
router.get("/:token", getAppointmentByToken);

module.exports = router;
