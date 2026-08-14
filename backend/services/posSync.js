'use strict';

/**
 * services/posSync.js
 *
 * All communication with the Afymis POS API lives here.
 *
 * Responsibilities:
 *  - fetchMedicinesFromPOS()     → GET  /api/medicines
 *  - deductStockOnPOS()          → POST /api/updatestock
 *  - syncMedicinesToLocalDB()    → upserts POS data into pos_medicines table
 *  - startAutoSync()             → runs a background interval (called once at startup)
 *
 * All POS HTTP calls go through the private _posRequest() helper so auth
 * headers and base URL are configured in exactly one place.
 */

const axios  = require('axios');
const db     = require('../config/db');
const { logger } = require('../utils/logger');

// ── Config ────────────────────────────────────────────────────────────────────
const POS_BASE_URL     = (process.env.POS_API_BASE_URL || 'https://afymis.cloud254.org/api').replace(/\/$/, '');
const POS_TOKEN        = process.env.POS_API_TOKEN || '';
const SYNC_INTERVAL_MS = (parseInt(process.env.POS_SYNC_INTERVAL_MINUTES) || 60) * 60 * 1000;

// Simple in-process cache so product listings don't hammer the POS API
const _cache = {
  medicines: null,   // Array<{pos_id, name, pos_price, pos_quantity}>
  fetchedAt:  null,  // Date
  TTL_MS:     5 * 60 * 1000,  // 5 minutes
};

// ── Private helpers ────────────────────────────────────────────────────────────

/**
 * Shared Axios instance with POS auth baked in.
 */
const _posClient = axios.create({
  baseURL: POS_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${POS_TOKEN}`,
  },
});

/**
 * Normalise the raw POS record into a predictable shape.
 * The API returns strings for price & quantity — coerce them here.
 */
function _normaliseMedicine(raw) {
  return {
    pos_id:       parseInt(raw.id, 10),
    name:         (raw.name || '').trim(),
    pos_price:    parseFloat(raw.price)    || 0,
    pos_quantity: parseInt(raw.quantity, 10) || 0,
  };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Fetch the full medicines list from the POS.
 * Results are cached in memory for 5 minutes to avoid redundant large requests.
 *
 * @param {boolean} forceRefresh  – bypass cache
 * @returns {Promise<Array>}
 */
async function fetchMedicinesFromPOS(forceRefresh = false) {
  const now = Date.now();
  if (
    !forceRefresh &&
    _cache.medicines &&
    _cache.fetchedAt &&
    now - _cache.fetchedAt < _cache.TTL_MS
  ) {
    return _cache.medicines;
  }

  const response = await _posClient.get('/medicines');

  // POS returns { status: "success", data: [...] }
  const raw = response.data?.data ?? response.data ?? [];
  if (!Array.isArray(raw)) {
    throw new Error(`Unexpected POS response shape: ${JSON.stringify(response.data).slice(0, 200)}`);
  }

  const medicines = raw
    .filter(r => r.id && r.name)          // skip entries without id or name
    .map(_normaliseMedicine);

  _cache.medicines = medicines;
  _cache.fetchedAt = now;

  return medicines;
}

/**
 * Deduct stock from the POS after a website order is placed.
 * Only sends items that have a pos_medicine_id.
 *
 * @param {number} orderId
 * @param {Array<{pos_medicine_id: number, quantity: number, product_name: string}>} items
 * @returns {Promise<{success: boolean, results: Array}>}
 */
async function deductStockOnPOS(orderId, items) {
  // Filter out items that have no POS link
  const posItems = items.filter(i => i.pos_medicine_id && i.quantity > 0);

  if (posItems.length === 0) {
    return { success: true, results: [], skipped: items.length };
  }

  const payload = posItems.map(i => ({
    medicine_id: i.pos_medicine_id,
    quantity:    i.quantity,
  }));

  const results = [];
  let allOk = true;

  try {
    const response = await _posClient.post('/updatestock', payload);
    const data = response.data;

    // POS returns { status: true|false, message: "..." }
    const success = data?.status === true;
    if (!success) allOk = false;

    // Log every item deduction to the audit table
    for (const item of posItems) {
      await _logDeduction({
        orderId,
        posMedicineId: item.pos_medicine_id,
        quantity:      item.quantity,
        status:        success ? 'success' : 'failed',
        response:      JSON.stringify(data),
      });
      results.push({ pos_medicine_id: item.pos_medicine_id, success, message: data?.message });
    }
  } catch (err) {
    allOk = false;
    logger.error(`POS stock deduction failed for order #${orderId}`, err);
    for (const item of posItems) {
      await _logDeduction({
        orderId,
        posMedicineId: item.pos_medicine_id,
        quantity:      item.quantity,
        status:        'failed',
        response:      err.message,
      });
      results.push({ pos_medicine_id: item.pos_medicine_id, success: false, message: err.message });
    }
  }

  // Invalidate cache so next product fetch reflects updated quantities
  _cache.medicines = null;

  return { success: allOk, results };
}

/**
 * Upsert the POS catalogue into the local pos_medicines table.
 * Called by the sync controller and the background interval.
 *
 * @returns {Promise<{fetched: number, upserted: number, durationMs: number}>}
 */
async function syncMedicinesToLocalDB() {
  const startAt = Date.now();
  let fetched = 0;
  let upserted = 0;

  try {
    const medicines = await fetchMedicinesFromPOS(true); // always force fresh on a full sync
    fetched = medicines.length;

    if (fetched === 0) {
      await _logSync({ fetched: 0, upserted: 0, status: 'success', durationMs: Date.now() - startAt });
      return { fetched: 0, upserted: 0, durationMs: Date.now() - startAt };
    }

    // Batch upsert using INSERT … ON DUPLICATE KEY UPDATE
    // MySQL handles this atomically and is much faster than one query per row.
    const BATCH = 500;
    for (let i = 0; i < medicines.length; i += BATCH) {
      const chunk = medicines.slice(i, i + BATCH);

      const placeholders = chunk.map(() => '(?, ?, ?, ?)').join(', ');
      const values = chunk.flatMap(m => [m.pos_id, m.name, m.pos_price, m.pos_quantity]);

      await db.query(
        `INSERT INTO pos_medicines (pos_id, name, pos_price, pos_quantity)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
           name         = VALUES(name),
           pos_price    = VALUES(pos_price),
           pos_quantity = VALUES(pos_quantity),
           last_synced  = NOW()`,
        values
      );

      upserted += chunk.length;
    }

    const durationMs = Date.now() - startAt;
    await _logSync({ fetched, upserted, status: 'success', durationMs });

    logger.info(`POS sync complete — fetched: ${fetched}, upserted: ${upserted}, took: ${durationMs}ms`);
    return { fetched, upserted, durationMs };

  } catch (err) {
    const durationMs = Date.now() - startAt;
    logger.error('POS sync failed', err);
    await _logSync({ fetched, upserted, status: 'failed', error: err.message, durationMs });
    throw err;
  }
}

/**
 * Start the background auto-sync interval.
 * Call once at application startup (server.js).
 * Does an immediate sync on first call, then repeats on the interval.
 */
function startAutoSync() {
  if (!POS_TOKEN) {
    logger.warn('POS_API_TOKEN not set — auto-sync disabled.');
    return;
  }

  logger.info(`POS auto-sync starting. Interval: ${SYNC_INTERVAL_MS / 60000} minutes.`);

  // Run immediately then on a schedule
  syncMedicinesToLocalDB().catch(err =>
    logger.error('Initial POS sync failed:', err.message)
  );

  setInterval(() => {
    syncMedicinesToLocalDB().catch(err =>
      logger.error('Scheduled POS sync failed:', err.message)
    );
  }, SYNC_INTERVAL_MS);
}

/**
 * Invalidate the in-memory cache.
 * Useful after a manual sync so the next GET /pos-medicines returns fresh data.
 */
function invalidateCache() {
  _cache.medicines = null;
  _cache.fetchedAt = null;
}

// ── Private DB helpers ─────────────────────────────────────────────────────────

async function _logSync({ fetched, upserted, status, error = null, durationMs }) {
  try {
    await db.query(
      `INSERT INTO pos_sync_log (records_fetched, records_upserted, status, error_message, duration_ms)
       VALUES (?, ?, ?, ?, ?)`,
      [fetched, upserted, status, error, durationMs]
    );
  } catch (_) {
    // Log table may not exist yet during first startup — swallow silently
  }
}

async function _logDeduction({ orderId, posMedicineId, quantity, status, response }) {
  try {
    await db.query(
      `INSERT INTO pos_stock_deductions (order_id, pos_medicine_id, quantity, status, response)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, posMedicineId, quantity, status, response]
    );
  } catch (_) {
    // Swallow — we don't want a logging failure to break order creation
  }
}

module.exports = {
  fetchMedicinesFromPOS,
  deductStockOnPOS,
  syncMedicinesToLocalDB,
  startAutoSync,
  invalidateCache,
};
