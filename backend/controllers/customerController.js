/**
 * Customer Controller
 * Handles customer account creation, profile management,
 * order history, and reorder functionality.
 */

const db = require('../config/db');
const { logger } = require('../utils/logger');

// ──────────────────────────────────────────────────────────────
// POST /api/customers/auth
// Called after Firebase sign-in to create or update the profile.
// Links any past orders placed with the same email.
// ──────────────────────────────────────────────────────────────
exports.upsertCustomer = async (req, res) => {
  const {
    name, phone, delivery_address, landmark, city, county,
    date_of_birth, blood_type, chronic_conditions, allergies,
    emergency_contact_name, emergency_contact_phone, profile_completed
  } = req.body;
  const { uid, email, picture, firebase_sign_in_provider } = req.firebaseUser;

  const provider = firebase_sign_in_provider?.includes('google') ? 'google' : 'email';
  const profilePicture = picture || null;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [insertResult] = await conn.query(
      `INSERT INTO customers
         (firebase_uid, email, name, phone, delivery_address, landmark, city, county,
          date_of_birth, blood_type, chronic_conditions, allergies,
          emergency_contact_name, emergency_contact_phone, profile_completed,
          auth_provider, profile_picture)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         firebase_uid            = VALUES(firebase_uid),
         name                    = COALESCE(VALUES(name), name),
         phone                   = COALESCE(VALUES(phone), phone),
         delivery_address        = COALESCE(VALUES(delivery_address), delivery_address),
         landmark                = COALESCE(VALUES(landmark), landmark),
         city                    = COALESCE(VALUES(city), city),
         county                  = COALESCE(VALUES(county), county),
         date_of_birth           = COALESCE(VALUES(date_of_birth), date_of_birth),
         blood_type              = COALESCE(VALUES(blood_type), blood_type),
         chronic_conditions      = COALESCE(VALUES(chronic_conditions), chronic_conditions),
         allergies               = COALESCE(VALUES(allergies), allergies),
         emergency_contact_name  = COALESCE(VALUES(emergency_contact_name), emergency_contact_name),
         emergency_contact_phone = COALESCE(VALUES(emergency_contact_phone), emergency_contact_phone),
         profile_completed       = IF(VALUES(profile_completed) = TRUE, TRUE, profile_completed),
         profile_picture         = COALESCE(VALUES(profile_picture), profile_picture),
         updated_at              = NOW()`,
      [
        uid, email, name || email.split('@')[0], phone || null,
        delivery_address || null, landmark || null, city || null, county || null,
        date_of_birth || null, blood_type || 'Unknown',
        chronic_conditions || null, allergies || null,
        emergency_contact_name || null, emergency_contact_phone || null,
        profile_completed ? 1 : 0, provider, profilePicture
      ]
    );

    console.log('Insert result:', insertResult);
    console.log('Looking for firebase_uid:', uid);

    // Try to find by firebase_uid first, then by email as fallback
    let [customers] = await conn.query(
      'SELECT * FROM customers WHERE firebase_uid = ?', [uid]
    );
    let customer = customers[0];

    if (!customer) {
      // Maybe the record was updated by email match, try finding by email
      [customers] = await conn.query(
        'SELECT * FROM customers WHERE email = ?', [email]
      );
      customer = customers[0];
    }

    console.log('Customer after insert:', customer);

    if (!customer) {
      throw new Error(`Failed to create/update customer profile for uid: ${uid}, email: ${email}`);
    }

    // Link historical orders by email
    await conn.query(
      'UPDATE orders SET customer_id = ? WHERE email = ? AND customer_id IS NULL',
      [customer.id, email]
    );

    // Link historical appointments by email
    await conn.query(
      'UPDATE appointments SET customer_id = ? WHERE email = ? AND customer_id IS NULL',
      [customer.id, email]
    );

    await conn.commit();
    logger.info('Customer upserted', { customerId: customer.id, provider });
    return res.json({ success: true, customer: sanitize(customer) });
  } catch (err) {
    await conn.rollback();
    logger.error('Customer upsert error', { error: err.message, stack: err.stack });
    return res.status(500).json({ error: 'Failed to save profile', details: err.message });
  } finally {
    conn.release();
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/customers/profile
// ──────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const [[customer]] = await db.query(
      'SELECT * FROM customers WHERE firebase_uid = ?',
      [req.firebaseUser.uid]
    );
    if (!customer) return res.status(404).json({ error: 'Profile not found' });
    return res.json({ success: true, customer: sanitize(customer) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ──────────────────────────────────────────────────────────────
// PUT /api/customers/profile
// ──────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const {
    name, phone, delivery_address, landmark, city, county,
    date_of_birth, blood_type, chronic_conditions, allergies,
    emergency_contact_name, emergency_contact_phone
  } = req.body;
  try {
    await db.query(
      `UPDATE customers
       SET name=?, phone=?, delivery_address=?, landmark=?, city=?, county=?,
           date_of_birth=?, blood_type=?, chronic_conditions=?, allergies=?,
           emergency_contact_name=?, emergency_contact_phone=?, updated_at=NOW()
       WHERE firebase_uid=?`,
      [name, phone, delivery_address, landmark, city, county,
       date_of_birth || null, blood_type || 'Unknown', chronic_conditions, allergies,
       emergency_contact_name, emergency_contact_phone, req.firebaseUser.uid]
    );
    const [[updated]] = await db.query(
      'SELECT * FROM customers WHERE firebase_uid = ?',
      [req.firebaseUser.uid]
    );
    return res.json({ success: true, customer: sanitize(updated) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/customers/orders
// Returns full order history for the logged-in customer
// ──────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const [[customer]] = await db.query(
      'SELECT id, email FROM customers WHERE firebase_uid = ?',
      [req.firebaseUser.uid]
    );
    if (!customer) return res.status(404).json({ error: 'Profile not found' });

    // Match by customer_id OR by email (for pre-account orders)
    const [orders] = await db.query(
      `SELECT o.*,
              GROUP_CONCAT(
                JSON_OBJECT(
                  'id', oi.id,
                  'product_id', oi.product_id,
                  'name', COALESCE(oi.item_name, p.name),
                  'quantity', oi.quantity,
                  'price', oi.price
                )
              ) AS items_json
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.customer_id = ? OR o.email = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [customer.id, customer.email]
    );

    const parsed = orders.map(o => ({
      ...o,
      items: o.items_json ? JSON.parse(`[${o.items_json}]`) : []
    }));
    // Remove raw json field
    parsed.forEach(o => delete o.items_json);

    return res.json({ success: true, orders: parsed });
  } catch (err) {
    logger.error('getMyOrders error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/customers/reorder/:orderId
// Creates a new order based on a previous one.
// Accepts optional overrides (phone, delivery_address, items edits).
// ──────────────────────────────────────────────────────────────
exports.reorder = async (req, res) => {
  const { orderId } = req.params;
  // Optional overrides from request body
  const overrides = req.body || {};

  const conn = await db.getConnection();
  try {
    // Verify this order belongs to the customer
    const [[customer]] = await conn.query(
      'SELECT id, email FROM customers WHERE firebase_uid = ?',
      [req.firebaseUser.uid]
    );
    if (!customer) return res.status(404).json({ error: 'Profile not found' });

    const [[original]] = await conn.query(
      'SELECT * FROM orders WHERE id = ? AND (customer_id = ? OR email = ?)',
      [orderId, customer.id, customer.email]
    );
    if (!original) return res.status(404).json({ error: 'Order not found' });

    const [originalItems] = await conn.query(
      `SELECT oi.*, COALESCE(oi.item_name, p.name) as name, p.stock
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    // Use overrides or original values
    const items = overrides.items || originalItems.map(i => ({
      product_id: i.product_id,
      quantity: i.quantity,
      price: i.price
    }));

    // Return the draft for the client to confirm — don't create order yet
    return res.json({
      success: true,
      draft: {
        customer_name: overrides.customer_name || original.customer_name,
        email: customer.email,
        phone: overrides.phone || original.phone,
        delivery_address: overrides.delivery_address || original.delivery_address,
        delivery_type: overrides.delivery_type || original.delivery_type,
        delivery_zone: overrides.delivery_zone || original.delivery_zone,
        shipping_cost: overrides.shipping_cost || original.shipping_cost,
        notes: overrides.notes || original.notes,
        items: items.map(i => ({
          product_id: i.product_id,
          name: i.name || overrides.items?.find(oi => oi.product_id === i.product_id)?.name,
          quantity: i.quantity,
          price: i.price
        }))
      }
    });
  } catch (err) {
    logger.error('Reorder error', { error: err.message });
    return res.status(500).json({ error: 'Failed to prepare reorder' });
  } finally {
    conn.release();
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/customers/prescriptions
// Returns uploaded prescriptions for the logged-in customer
// ──────────────────────────────────────────────────────────────
exports.getMyPrescriptions = async (req, res) => {
  try {
    const [[customer]] = await db.query(
      'SELECT email FROM customers WHERE firebase_uid = ?',
      [req.firebaseUser.uid]
    );
    if (!customer) return res.status(404).json({ error: 'Profile not found' });

    const [prescriptions] = await db.query(
      'SELECT * FROM prescriptions WHERE email = ? ORDER BY created_at DESC',
      [customer.email]
    );
    return res.json({ success: true, prescriptions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
};

// ──────────────────────────────────────────────────────────────
// Admin: GET /api/admin/customers
// ──────────────────────────────────────────────────────────────
// Admin: GET /api/admin/customers
// ──────────────────────────────────────────────────────────────
exports.getAllCustomers = async (req, res) => {
  try {
    const [customers] = await db.query(`
      SELECT c.*,
             COUNT(DISTINCT CASE WHEN o.status IN ('paid', 'dispatched', 'ready_for_pickup', 'completed') THEN o.id END) AS order_count,
             COALESCE(SUM(CASE WHEN o.status IN ('paid', 'dispatched', 'ready_for_pickup', 'completed') THEN o.total ELSE 0 END), 0) AS total_spent,
             MAX(CASE WHEN o.status IN ('paid', 'dispatched', 'ready_for_pickup', 'completed') THEN o.created_at END) AS last_order_at
      FROM customers c
      LEFT JOIN orders o ON (o.customer_id = c.id OR o.email = c.email)
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return res.json({ success: true, customers: customers.map(sanitize) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Strip sensitive fields
const sanitize = (c) => {
  const { firebase_uid, ...safe } = c;
  return safe;
};
