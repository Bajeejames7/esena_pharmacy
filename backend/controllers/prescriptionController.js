const db = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * POST /api/prescriptions/upload
 * Accepts a prescription file + patient details and stores them in the DB
 */
exports.uploadPrescription = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    // Validate required fields
    if (!name || !phone || !email) {
      return res.status(400).json({ success: false, message: 'Name, phone, and email are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Prescription file is required.' });
    }

    const filePath = req.file.filename; // stored filename

    const [result] = await db.query(
      `INSERT INTO prescriptions (name, phone, email, message, file_path, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [name, phone, email, message || null, filePath]
    );

    res.status(201).json({
      success: true,
      message: 'Prescription submitted successfully. Our pharmacist will contact you within 2 hours.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Prescription upload error:', error);
    // Clean up uploaded file on DB error
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/prescriptions', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({ success: false, message: 'Failed to submit prescription. Please try again.' });
  }
};

/**
 * GET /api/admin/prescriptions
 * Returns all prescriptions for admin review
 */
exports.getPrescriptions = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM prescriptions ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch prescriptions.' });
  }
};

/**
 * PATCH /api/admin/prescriptions/:id/status
 * Update prescription status (pending -> reviewed / completed)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'reviewed', 'completed', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    await db.query('UPDATE prescriptions SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Status updated.' });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};
