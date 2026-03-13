#!/usr/bin/env node

/**
 * Script to create/update admin user with proper bcrypt password
 * Run this script to set up admin authentication
 */

const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function setupAdminUser() {
  try {
    console.log('Setting up admin user...');
    
    // Hash the password 'password' for demo purposes
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Check if admin user exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (existingUsers.length > 0) {
      // Update existing admin user
      await db.query(
        'UPDATE users SET password = ?, role = ? WHERE username = ?',
        [hashedPassword, 'admin', 'admin']
      );
      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin user
      await db.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created successfully');
    }
    
    console.log('Admin credentials:');
    console.log('Username: admin');
    console.log('Password: password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdminUser();