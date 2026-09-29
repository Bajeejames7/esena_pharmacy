const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../config/db');
const { uploadPrescription, getPrescriptions, updateStatus, createOrderFromPrescription } = require('../controllers/prescriptionController');
const auth = require('../middleware/auth');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/prescriptions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  // Random, not `originalname-timestamp`: a prescription is patient health
  // data, and a name built from the patient's own file name plus a millisecond
  // clock is a name somebody can guess.
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Public: submit a prescription
router.post('/upload', upload.single('prescription'), uploadPrescription);

// Admin: list all prescriptions
router.get('/', auth, getPrescriptions);

// Admin: the prescription file itself. Staff only — these are no longer served
// from the public /uploads folder (see server.js).
router.get('/:id/file', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT file_path FROM prescriptions WHERE id = ?', [req.params.id]);
    const filePath = rows[0]?.file_path;
    if (!filePath) return res.status(404).json({ message: 'No file for this prescription' });

    // file_path is a bare name written by multer above; refuse anything else.
    const name = path.basename(filePath);
    const full = path.join(uploadDir, name);
    if (name !== filePath || !fs.existsSync(full)) {
      return res.status(404).json({ message: 'Prescription file not found' });
    }
    res.set('Cache-Control', 'private, no-store');
    res.sendFile(full);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load prescription file' });
  }
});

// Admin: update status
router.patch('/:id/status', auth, updateStatus);

// Admin: create an order from a prescription
router.post('/:id/create-order', auth, createOrderFromPrescription);

module.exports = router;
