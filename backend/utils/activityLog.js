const db = require('../config/db');

/**
 * Log an employee action on a resource
 */
async function logActivity({ userId, userName, action, resourceType, resourceId, description, oldValue, newValue, ip }) {
  try {
    await db.query(
      `INSERT INTO activity_log (user_id, user_name, action, resource_type, resource_id, description, old_value, new_value, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userName || 'unknown',
        action,
        resourceType,
        resourceId || null,
        description || null,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ip || null
      ]
    );
  } catch (e) {
    // Non-fatal — don't break the main operation
    console.error('Activity log error:', e.message);
  }
}

module.exports = { logActivity };
