#!/usr/bin/env node

/**
 * Script to fix admin authentication issues
 * This script will:
 * 1. Set up proper admin user with bcrypt password
 * 2. Test the authentication flow
 * 3. Verify JWT token generation
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function fixAdminAuth() {
  let connection;
  
  try {
    console.log('🔧 Fixing Admin Authentication Issues...\n');

    // Step 1: Connect to database
    console.log('1. Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('✅ Database connected successfully');

    // Step 2: Check if users table exists
    console.log('\n2. Checking users table...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('❌ Users table does not exist. Please run the database schema first.');
      process.exit(1);
    }
    console.log('✅ Users table exists');

    // Step 3: Set up admin user with proper bcrypt password
    console.log('\n3. Setting up admin user...');
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Check if admin user exists
    const [existingUsers] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (existingUsers.length > 0) {
      // Update existing admin user
      await connection.execute(
        'UPDATE users SET password = ?, role = ? WHERE username = ?',
        [hashedPassword, 'admin', 'admin']
      );
      console.log('✅ Admin user updated with new password hash');
    } else {
      // Create new admin user
      await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created successfully');
    }

    // Step 4: Test password verification
    console.log('\n4. Testing password verification...');
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    const user = users[0];
    const isPasswordValid = await bcrypt.compare('password', user.password);
    
    if (isPasswordValid) {
      console.log('✅ Password verification works correctly');
    } else {
      console.log('❌ Password verification failed');
      process.exit(1);
    }

    // Step 5: Test JWT token generation
    console.log('\n5. Testing JWT token generation...');
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET not found in environment variables');
      process.exit(1);
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT token generated successfully');
    console.log('Token preview:', token.substring(0, 50) + '...');

    // Step 6: Test JWT token verification
    console.log('\n6. Testing JWT token verification...');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT token verification successful');
      console.log('Decoded payload:', { userId: decoded.userId, role: decoded.role });
    } catch (error) {
      console.log('❌ JWT token verification failed:', error.message);
      process.exit(1);
    }

    console.log('\n🎉 Admin Authentication Setup Complete!\n');
    console.log('📋 SUMMARY:');
    console.log('===========');
    console.log('✅ Database connection: Working');
    console.log('✅ Admin user: Set up with bcrypt password');
    console.log('✅ Password verification: Working');
    console.log('✅ JWT token generation: Working');
    console.log('✅ JWT token verification: Working');
    console.log('');
    console.log('🔑 Admin Credentials:');
    console.log('Username: admin');
    console.log('Password: password');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Rebuild the frontend: cd frontend && npm run build');
    console.log('2. Test admin login at: https://esena.co.ke/admin/login');
    console.log('3. The 401 Unauthorized errors should now be resolved!');

  } catch (error) {
    console.error('❌ Error fixing admin authentication:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the fix
fixAdminAuth();