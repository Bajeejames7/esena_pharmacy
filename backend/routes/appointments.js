const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const {
  createAppointment,
  getAppointmentByToken,
  getAllAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  getAvailability
} = require("../controllers/appointmentController");
const {
  getNotes, addNote, deleteNote,
  getReports, uploadReport, deleteReport
} = require("../controllers/appointmentNotesController");

// File upload config for reports
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `report_appt${req.params.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png|doc|docx/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  }
});

// Public routes
router.post("/", createAppointment);
router.get("/availability", getAvailability);

// Protected routes (require JWT authentication)
router.get("/", auth, getAllAppointments);
router.put("/:id/status", auth, updateAppointmentStatus);
router.put("/:id/reschedule", auth, rescheduleAppointment);

// Notes (admin)
router.get("/:id/notes",           auth, getNotes);
router.post("/:id/notes",          auth, addNote);
router.delete("/:id/notes/:noteId",auth, deleteNote);

// Reports (admin upload)
router.get("/:id/reports",              auth, getReports);
router.post("/:id/reports",            auth, upload.single('report'), uploadReport);
router.delete("/:id/reports/:reportId",auth, deleteReport);

// Public routes (must come after protected routes to avoid conflicts)
router.get("/:token", getAppointmentByToken);

module.exports = router;
