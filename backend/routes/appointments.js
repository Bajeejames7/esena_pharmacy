const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus
} = require("../controllers/appointmentController");

router.post("/", createAppointment);
router.get("/", auth, getAllAppointments);
router.put("/:id/status", auth, updateAppointmentStatus);

module.exports = router;
