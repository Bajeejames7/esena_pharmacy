/**
 * Appointment Notes & Reports Controller
 * Allows admin/doctors to add consultation notes and upload reports
 * that are visible to the client through their account.
 */

const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// ──────────────────────────────────────────────────────────────
// GET /api/appointments/:id/notes  (admin)
// GET /api/customers/appointments/:id/notes  (client - filtered)
// ──────────────────────────────────────────────────────────────
exports.getNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const clientView = req.query.clientView === 'true';

    let query = 'SELECT * FROM appointment_notes WHERE appointment_id = ?';
    if (clientView) query += ' AND is_visible_to_client = TRUE';
    query += ' ORDER BY created_at DESC';

    const [notes] = await db.query(query, [id]);
    return res.json({ success: true, notes });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/appointments/:id/notes  (admin)
// ──────────────────────────────────────────────────────────────
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, is_visible_to_client = true } = req.body;

    if (!note?.trim()) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    // Verify appointment exists
    const [appts] = await db.query('SELECT id FROM appointments WHERE id = ?', [id]);
    if (!appts.length) return res.status(404).json({ error: 'Appointment not found' });

    const [result] = await db.query(
      `INSERT INTO appointment_notes
       (appointment_id, admin_id, admin_name, note, is_visible_to_client)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user?.userId || null, req.user?.username || 'Admin',
       note.trim(), is_visible_to_client ? 1 : 0]
    );

    const [[created]] = await db.query(
      'SELECT * FROM appointment_notes WHERE id = ?', [result.insertId]
    );
    return res.status(201).json({ success: true, note: created });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add note' });
  }
};

// ──────────────────────────────────────────────────────────────
// DELETE /api/appointments/:id/notes/:noteId  (admin)
// ──────────────────────────────────────────────────────────────
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    await db.query('DELETE FROM appointment_notes WHERE id = ?', [noteId]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete note' });
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/appointments/:id/reports  (admin or client)
// ──────────────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  try {
    const { id } = req.params;
    const clientView = req.query.clientView === 'true';

    let query = 'SELECT * FROM appointment_reports WHERE appointment_id = ?';
    if (clientView) query += ' AND is_visible_to_client = TRUE';
    query += ' ORDER BY created_at DESC';

    const [reports] = await db.query(query, [id]);
    return res.json({ success: true, reports });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/appointments/:id/reports  (admin — multipart upload)
// ──────────────────────────────────────────────────────────────
exports.uploadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, is_visible_to_client = true } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const [appts] = await db.query('SELECT id FROM appointments WHERE id = ?', [id]);
    if (!appts.length) return res.status(404).json({ error: 'Appointment not found' });

    const [result] = await db.query(
      `INSERT INTO appointment_reports
       (appointment_id, admin_id, admin_name, file_name, file_path, file_type, description, is_visible_to_client)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.user?.userId || null,
        req.user?.username || 'Admin',
        req.file.originalname,
        req.file.filename,
        req.file.mimetype,
        description || null,
        is_visible_to_client ? 1 : 0
      ]
    );

    const [[created]] = await db.query(
      'SELECT * FROM appointment_reports WHERE id = ?', [result.insertId]
    );
    return res.status(201).json({ success: true, report: created });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload report' });
  }
};

// ──────────────────────────────────────────────────────────────
// DELETE /api/appointments/:id/reports/:reportId  (admin)
// ──────────────────────────────────────────────────────────────
exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const [[report]] = await db.query(
      'SELECT * FROM appointment_reports WHERE id = ?', [reportId]
    );
    if (report) {
      // Delete physical file
      const filePath = path.join(__dirname, '../uploads', report.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await db.query('DELETE FROM appointment_reports WHERE id = ?', [reportId]);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete report' });
  }
};

// ──────────────────────────────────────────────────────────────
// Client: GET /api/customers/appointments
// Returns all appointments for the logged-in customer with notes + reports
// ──────────────────────────────────────────────────────────────
exports.getMyAppointments = async (req, res) => {
  try {
    const [[customer]] = await db.query(
      'SELECT email FROM customers WHERE firebase_uid = ?',
      [req.firebaseUser.uid]
    );
    if (!customer) return res.status(404).json({ error: 'Profile not found' });

    const [appointments] = await db.query(
      'SELECT * FROM appointments WHERE email = ? ORDER BY date DESC',
      [customer.email]
    );

    // For each appointment, fetch visible notes and reports
    const enriched = await Promise.all(appointments.map(async (appt) => {
      const [notes] = await db.query(
        'SELECT * FROM appointment_notes WHERE appointment_id = ? AND is_visible_to_client = TRUE ORDER BY created_at DESC',
        [appt.id]
      );
      const [reports] = await db.query(
        'SELECT * FROM appointment_reports WHERE appointment_id = ? AND is_visible_to_client = TRUE ORDER BY created_at DESC',
        [appt.id]
      );
      return { ...appt, notes, reports };
    }));

    return res.json({ success: true, appointments: enriched });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};
