const db = require('./config/db');

async function fixDeliveryStatus() {
  try {
    console.log('Checking orders table status column...');
    
    // Check current enum values
    const [[column]] = await db.query(`
      SHOW COLUMNS FROM orders WHERE Field = 'status'
    `);
    
    console.log('Current status ENUM:', column.Type);
    
    // Update to include out_for_delivery (for backward compatibility)
    // Even though we're removing it from UI
    console.log('\nUpdating orders status ENUM to include out_for_delivery...');
    
    await db.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM(
        'pending',
        'payment_requested',
        'paid',
        'dispatched',
        'out_for_delivery',
        'ready_for_pickup',
        'completed',
        'cancelled'
      ) NOT NULL DEFAULT 'pending'
    `);
    
    console.log('✓ Orders table status ENUM updated successfully');
    
    // Check deliveries table
    const [[delColumn]] = await db.query(`
      SHOW COLUMNS FROM deliveries WHERE Field = 'status'
    `);
    
    console.log('\nDeliveries table status ENUM:', delColumn.Type);
    console.log('✓ Deliveries table is fine');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixDeliveryStatus();
