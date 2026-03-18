const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/settings/delivery — public, used by checkout to show live prices
router.get('/delivery', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('delivery_nairobi','delivery_outside_nairobi','pickup_cost')"
    );
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = parseFloat(r.setting_value); });
    // Fallback defaults if table not yet seeded
    res.json({
      delivery_nairobi: settings.delivery_nairobi ?? 150,
      delivery_outside_nairobi: settings.delivery_outside_nairobi ?? 350,
      pickup_cost: settings.pickup_cost ?? 0
    });
  } catch (error) {
    res.json({ delivery_nairobi: 150, delivery_outside_nairobi: 350, pickup_cost: 0 });
  }
});

// PUT /api/settings/delivery — admin only
router.put('/delivery', auth, async (req, res) => {
  try {
    const { delivery_nairobi, delivery_outside_nairobi, pickup_cost } = req.body;
    const updates = [];
    if (delivery_nairobi !== undefined) updates.push(['delivery_nairobi', String(delivery_nairobi)]);
    if (delivery_outside_nairobi !== undefined) updates.push(['delivery_outside_nairobi', String(delivery_outside_nairobi)]);
    if (pickup_cost !== undefined) updates.push(['pickup_cost', String(pickup_cost)]);

    for (const [key, value] of updates) {
      await db.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [key, value, value]
      );
    }
    res.json({ message: 'Delivery settings updated successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
