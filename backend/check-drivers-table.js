const db = require('./config/db');

async function checkTables() {
  try {
    console.log('Checking for drivers tables...');
    
    const [tables] = await db.query("SHOW TABLES LIKE '%driver%'");
    console.log('Driver-related tables:', tables);
    
    if (tables.length === 0) {
      console.log('\n❌ No driver tables found! Need to run migration.');
      console.log('Run: node migrate-drivers.js');
    } else {
      console.log('\n✅ Driver tables exist');
      
      // Check drivers table structure
      const [driverCols] = await db.query('DESCRIBE drivers');
      console.log('\nDrivers table columns:');
      driverCols.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
      
      // Check if any drivers exist
      const [[count]] = await db.query('SELECT COUNT(*) as count FROM drivers');
      console.log(`\nDrivers in database: ${count.count}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

checkTables();
