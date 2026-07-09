const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'esena_pharmacy'
  });

  try {
    console.log('\n=== CHECKING DATABASE SCHEMA ===\n');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables.length);
    tables.forEach(t => console.log('  -', Object.values(t)[0]));

    console.log('\n=== ORDERS TABLE ===');
    const [ordersCols] = await connection.query('DESCRIBE orders');
    console.log('Columns:', ordersCols.length);
    ordersCols.forEach(c => console.log(`  ${c.Field} (${c.Type}) ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${c.Default ? `DEFAULT ${c.Default}` : ''}`));

    console.log('\n=== DRIVERS TABLE ===');
    const [driversCols] = await connection.query('DESCRIBE drivers');
    console.log('Columns:', driversCols.length);
    driversCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

    console.log('\n=== DELIVERIES TABLE ===');
    const [deliveriesCols] = await connection.query('DESCRIBE deliveries');
    console.log('Columns:', deliveriesCols.length);
    deliveriesCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

    console.log('\n=== CUSTOMERS TABLE ===');
    const [customersCols] = await connection.query('DESCRIBE customers');
    console.log('Columns:', customersCols.length);
    customersCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

    console.log('\n=== MPESA_PAYMENTS TABLE ===');
    const [mpesaCols] = await connection.query('DESCRIBE mpesa_payments');
    console.log('Columns:', mpesaCols.length);
    mpesaCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

    console.log('\n=== CHECK COMPLETE ===\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkSchema();
