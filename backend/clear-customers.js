/**
 * Clear Customer Users from Database
 * Run this from backend directory: node clear-customers.js
 */

const db = require('./config/db');

async function clearCustomers() {
  console.log('\n=== CLEARING CUSTOMER USERS ===\n');

  try {
    // First, show existing customers
    console.log('📋 Fetching existing customers...\n');
    const [customers] = await db.query(
      'SELECT id, email, name, firebase_uid, profile_completed, created_at FROM customers'
    );

    if (customers.length > 0) {
      console.log(`Found ${customers.length} customer(s):\n`);
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.email}`);
        console.log(`   Name: ${customer.name}`);
        console.log(`   Firebase UID: ${customer.firebase_uid}`);
        console.log(`   Profile Completed: ${customer.profile_completed ? 'Yes' : 'No'}`);
        console.log(`   Created: ${customer.created_at}`);
        console.log('   ---');
      });
    } else {
      console.log('No customers found.');
    }

    // Delete all customers
    console.log('\n🗑️  Deleting all customers...\n');
    const [deleteResult] = await db.query('DELETE FROM customers');
    console.log(`✓ Successfully deleted ${deleteResult.affectedRows} customer record(s)`);

    // Verify deletion
    console.log('\n✅ Verifying deletion...\n');
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM customers');
    console.log(`Remaining customers: ${count}`);

    if (count === 0) {
      console.log('\n✓ All customers cleared successfully!');
      console.log('You can now test the profile completion flow from scratch.\n');
    } else {
      console.log(`\n⚠ Warning: ${count} customer(s) still remain\n`);
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

clearCustomers();
