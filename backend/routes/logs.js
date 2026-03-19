const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const auth = require('../middleware/auth');
const { logsDir, canWriteLogs } = require('../utils/logger');

// All routes require admin auth
router.use(auth);

// GET /api/admin/logs — list available log files
router.get('/', (req, res) => {
  if (!canWriteLogs) {
    return res.json({
      canWriteLogs: false,
      message: 'Log file writing is disabled — check server file permissions on the logs directory.',
      logsDir
    });
  }

  try {
    const files = fs.readdirSync(logsDir)
      .filter(f => f.endsWith('.log'))
      .map(f => {
        const stat = fs.statSync(path.join(logsDir, f));
        return { name: f, size: stat.size, modified: stat.mtime };
      })
      .sort((a, b) => new Date(b.modified) - new Date(a.modified));

    res.json({ canWriteLogs: true, logsDir, files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list log files', message: err.message });
  }
});

// GET /api/admin/logs/:filename?lines=100 — read a log file (last N lines)
router.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const lines = parseInt(req.query.lines) || 100;

  // Security: only allow .log files, no path traversal
  if (!filename.endsWith('.log') || filename.includes('/') || filename.includes('..')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const filePath = path.join(logsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Log file not found', filename });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const allLines = content.trim().split('\n').filter(Boolean);
    const tail = allLines.slice(-lines);

    // Parse JSON lines, fall back to raw string if malformed
    const parsed = tail.map(line => {
      try { return JSON.parse(line); } catch { return { raw: line }; }
    });

    res.json({
      filename,
      totalLines: allLines.length,
      returnedLines: parsed.length,
      entries: parsed
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read log file', message: err.message });
  }
});

module.exports = router;
