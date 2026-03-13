#!/usr/bin/env node

/**
 * Script to diagnose and fix the 400 Bad Request login error
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const https = require('https');
require('dotenv').config({ path: './backend/.env' });

// Test API endpoint
function testLogin(credentials) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(credentials);
    
    const options = {
      hostname: 'esena.co.ke',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function fixLogin400Error() {
  let connection;
  
  try {
    console.log('🔧 Fixing Login 400 Error...\n');

    // Step 1: Test current API response
    console.log('1. Testing current login API...');
    const apiTest = await testLogin({ username: 'admin', password: 'password' });
    console.log(`   Status: ${apiTest.status}`);
    console.log(`   Response:`, apiTest.data);

    if (apiTest.status === 200) {
      console.log('✅ Login is already working! The issue may be resolved.');
      return;
    }

    // Step 2: Check database connection
    console.log('\n2. Checking database connection...');
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError.message);
      console.log('   This is likely the cause of the 400 error');
      return;
    }

    // Step 3: Check users table
    console.log('\n3. Checking users table...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('❌ Users table does not exist');
      console.log('   Creating users table...');
      
      await connection.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin','doctor') DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Users table created');
    } else {
      console.log('✅ Users table exists');
    }

    // Step 4: Ensure admin user exists
    console.log('\n4. Setting up admin user...');
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    const hashedPassword = await bcrypt.hash('password', 10);
    
    if (users.length === 0) {
      await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created');
    } else {
      await connection.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );
      console.log('✅ Admin user password updated');
    }

    // Step 5: Test login again
    console.log('\n5. Testing login after fixes...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const finalTest = await testLogin({ username: 'admin', password: 'password' });
    console.log(`   Status: ${finalTest.status}`);
    console.log(`   Response:`, finalTest.data);

    if (finalTest.status === 200) {
      console.log('\n🎉 SUCCESS! Login is now working!');
      console.log('✅ The 401 Unauthorized errors should be resolved');
    } else if (finalTest.status === 400) {
      console.log('\n❌ Still getting 400 error. Additional debugging needed:');
      console.log('   - Check server logs for detailed error messages');
      console.log('   - Verify JWT_SECRET is set in backend/.env');
      console.log('   - Check if backend server is running properly');
    } else {
      console.log(`\n❓ Unexpected status: ${finalTest.status}`);
      console.log('   Check server logs for more information');
    }

    console.log('\n📋 SUMMARY:');
    console.log('===========');
    console.log('✅ Database connection: Working');
    console.log('✅ Users table: Exists');
    console.log('✅ Admin user: Set up with proper password');
    console.log('');
    console.log('If login still fails, check:');
    console.log('1. Backend server logs');
    console.log('2. Network connectivity');
    console.log('3. Server configuration');

  } catch (error) {
    console.error('❌ Error during fix:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixLogin400Error();