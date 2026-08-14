-- ============================================================
-- POS Integration Migration
-- Run once against the live DB before deploying the integration
-- ============================================================

-- 1. Master POS medicines cache
--    Mirrors the Afymis POS catalogue. Refreshed on every sync.
CREATE TABLE IF NOT EXISTS pos_medicines (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  pos_id        INT NOT NULL,                      -- the "id" field from the POS API
  name          VARCHAR(255) NOT NULL,
  pos_price     DECIMAL(10,2) NOT NULL DEFAULT 0,  -- selling price in the POS
  pos_quantity  INT NOT NULL DEFAULT 0,            -- stock level reported by POS
  last_synced   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pos_id (pos_id),
  INDEX idx_name (name)
);

-- 2. Link our website products back to a POS medicine
--    NULL means the product has no POS counterpart (web-only item).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS pos_medicine_id INT NULL DEFAULT NULL
    COMMENT 'FK to pos_medicines.pos_id — links website product to POS catalogue',
  ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) NULL DEFAULT NULL
    COMMENT 'Purchase / cost price used for profit margin calculation',
  ADD INDEX IF NOT EXISTS idx_pos_medicine_id (pos_medicine_id);

-- 3. Extend order_items so we know which POS medicine was sold
--    Captured at order-time so profit is correct even if prices change later.
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS pos_medicine_id  INT NULL DEFAULT NULL
    COMMENT 'pos_medicines.pos_id at time of sale',
  ADD COLUMN IF NOT EXISTS cost_price_at_sale DECIMAL(10,2) NULL DEFAULT NULL
    COMMENT 'Cost price snapshot at the moment the order was placed',
  ADD COLUMN IF NOT EXISTS item_name VARCHAR(255) NULL DEFAULT NULL
    COMMENT 'Denormalised product name — survives product deletion';

-- 4. POS sync audit log
--    Keeps a record of every sync run for debugging / admin review.
CREATE TABLE IF NOT EXISTS pos_sync_log (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  synced_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  records_fetched INT NOT NULL DEFAULT 0,
  records_upserted INT NOT NULL DEFAULT 0,
  status         ENUM('success','failed') NOT NULL DEFAULT 'success',
  error_message  TEXT NULL,
  duration_ms    INT NULL
);

-- 5. POS stock deduction log
--    Every call we make to POST /api/updatestock is recorded here.
CREATE TABLE IF NOT EXISTS pos_stock_deductions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  pos_medicine_id INT NOT NULL,
  quantity     INT NOT NULL,
  status       ENUM('success','failed','skipped') NOT NULL DEFAULT 'success',
  response     TEXT NULL,                          -- raw API response for debugging
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_pos_medicine_id (pos_medicine_id)
);
