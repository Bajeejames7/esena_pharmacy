#!/usr/bin/env node

/**
 * Quick script to check if admin user exists and test password
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkAdminUser() {
  let connection;
  
  try {
    console.log('🔍 Checking Admin User Status...\n');

    // Connect to database
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Database connected');

    // Check if users table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('❌ Users table does not exist');
      console.log('   Run the database schema first: backend/database/schema.sql');
      return;
    }
    console.log('✅ Users table exists');

    // Check for admin user
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      console.log('❌ Admin user does not exist');
      console.log('   Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('password', 10);
      await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user exists');
      const user = users[0];
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      
      // Test password
      const isPasswordValid = await bcrypt.compare('password', user.password);
      if (isPasswordValid) {
        console.log('✅ Password verification works');
      } else {
        console.log('❌ Password verification failed');
        console.log('   Updating password...');
        
        const hashedPassword = await bcrypt.hash('password', 10);
        await connection.execute(
          'UPDATE users SET password = ? WHERE username = ?',
          [hashedPassword, 'admin']
        );
        console.log('✅ Password updated');
      }
    }

    console.log('\n✅ Admin user is ready for authentication');
    console.log('Credentials: admin / password');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAdminUser();