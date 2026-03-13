const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/db');

/**
 * Web-based authentication fixer
 * Access via: https://esena.co.ke/api/fix-auth
 */

router.get('/', async (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esena Pharmacy - Admin Auth Fixer</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #28a745; background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .info { color: #0c5460; background: #d1ecf1; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .step { background: #f8f9fa; padding: 15px; margin: 15px 0; border-left: 4px solid #007bff; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .credentials { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Esena Pharmacy - Admin Authentication Fixer</h1>
        <p>This tool will diagnose and fix the 400 Bad Request login error.</p>

        <div class="step">
            <h3>🚀 Quick Actions</h3>
            <button onclick="checkStatus()">1. Check Current Status</button>
            <button onclick="fixDatabase()">2. Fix Database</button>
            <button onclick="fixAdmin()">3. Fix Admin User</button>
            <button onclick="testLogin()">4. Test Login API</button>
        </div>

        <div id="results"></div>

        <div class="credentials">
            <h3>🔑 Admin Credentials</h3>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> password</p>
            <p><em>Use these credentials to log in at: <a href="/admin/login" target="_blank">Admin Dashboard</a></em></p>
        </div>

        <div class="info">
            <h3>📋 Instructions</h3>
            <ol>
                <li>Click "Check Current Status" to see what's wrong</li>
                <li>If users table is missing, click "Fix Database"</li>
                <li>If admin user is missing or password is wrong, click "Fix Admin User"</li>
                <li>Click "Test Login API" to verify the fix</li>
                <li>Try logging in to the admin dashboard</li>
            </ol>
        </div>
    </div>

    <script>
        async function makeRequest(action) {
            const results = document.getElementById('results');
            results.innerHTML = '<div class="info">Processing...</div>';
            
            try {
                const response = await fetch('/api/fix-auth/' + action, { method: 'POST' });
                const data = await response.json();
                
                let html = '<div class="step"><h3>' + data.title + '</h3>';
                
                data.results.forEach(result => {
                    const className = result.type === 'success' ? 'success' : 
                                    result.type === 'error' ? 'error' : 'info';
                    html += '<div class="' + className + '">' + result.message + '</div>';
                });
                
                html += '</div>';
                results.innerHTML = html;
            } catch (error) {
                results.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
            }
        }

        function checkStatus() { makeRequest('check'); }
        function fixDatabase() { makeRequest('fix-database'); }
        function fixAdmin() { makeRequest('fix-admin'); }
        function testLogin() { makeRequest('test-login'); }
    </script>
</body>
</html>
  `;
  
  res.send(html);
});

// Check current status
router.post('/check', async (req, res) => {
  const results = [];
  
  try {
    // Check if users table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      results.push({ type: 'error', message: '❌ Users table does not exist' });
      results.push({ type: 'info', message: 'The users table needs to be created. Click "Fix Database".' });
    } else {
      results.push({ type: 'success', message: '✅ Users table exists' });
      
      // Check for admin user
      const [users] = await db.query("SELECT * FROM users WHERE username = ?", ['admin']);
      
      if (users.length === 0) {
        results.push({ type: 'error', message: '❌ Admin user does not exist' });
        results.push({ type: 'info', message: 'Click "Fix Admin User" to create the admin user.' });
      } else {
        const user = users[0];
        results.push({ type: 'success', message: `✅ Admin user exists (ID: ${user.id})` });
        
        // Test password
        const isPasswordValid = await bcrypt.compare('password', user.password);
        if (isPasswordValid) {
          results.push({ type: 'success', message: '✅ Password verification works' });
          results.push({ type: 'success', message: '🎉 Authentication should be working! Try logging in again.' });
        } else {
          results.push({ type: 'error', message: '❌ Password verification failed' });
          results.push({ type: 'info', message: 'Click "Fix Admin User" to update the password.' });
        }
      }
    }
    
    res.json({ title: '📋 Current Status Check', results });
  } catch (error) {
    res.json({ 
      title: '❌ Status Check Failed', 
      results: [{ type: 'error', message: 'Error: ' + error.message }] 
    });
  }
});

// Fix database (create users table)
router.post('/fix-database', async (req, res) => {
  const results = [];
  
  try {
    const sql = `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','doctor') DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    await db.query(sql);
    results.push({ type: 'success', message: '✅ Users table created successfully' });
    
    res.json({ title: '🔨 Database Fixed', results });
  } catch (error) {
    res.json({ 
      title: '❌ Database Fix Failed', 
      results: [{ type: 'error', message: 'Error: ' + error.message }] 
    });
  }
});

// Fix admin user
router.post('/fix-admin', async (req, res) => {
  const results = [];
  
  try {
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Check if admin exists
    const [users] = await db.query("SELECT id FROM users WHERE username = ?", ['admin']);
    
    if (users.length > 0) {
      // Update existing user
      await db.query("UPDATE users SET password = ?, role = ? WHERE username = ?", 
        [hashedPassword, 'admin', 'admin']);
      results.push({ type: 'success', message: '✅ Admin user password updated' });
    } else {
      // Create new user
      await db.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", 
        ['admin', hashedPassword, 'admin']);
      results.push({ type: 'success', message: '✅ Admin user created' });
    }
    
    results.push({ type: 'info', message: 'You can now log in with username: admin, password: password' });
    
    res.json({ title: '👤 Admin User Fixed', results });
  } catch (error) {
    res.json({ 
      title: '❌ Admin User Fix Failed', 
      results: [{ type: 'error', message: 'Error: ' + error.message }] 
    });
  }
});

// Test login API
router.post('/test-login', async (req, res) => {
  const results = [];
  
  try {
    // Simulate the login process
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", ['admin']);
    
    if (users.length === 0) {
      results.push({ type: 'error', message: '❌ Admin user not found' });
    } else {
      const user = users[0];
      const isMatch = await bcrypt.compare('password', user.password);
      
      if (!isMatch) {
        results.push({ type: 'error', message: '❌ Password verification failed' });
      } else {
        // Test JWT token generation
        if (!process.env.JWT_SECRET) {
          results.push({ type: 'error', message: '❌ JWT_SECRET not found in environment' });
        } else {
          const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          results.push({ type: 'success', message: '✅ Login simulation successful' });
          results.push({ type: 'success', message: '✅ JWT token generated successfully' });
          results.push({ type: 'success', message: '🎉 Authentication is working! Try logging in now.' });
        }
      }
    }
    
    res.json({ title: '🧪 Login API Test', results });
  } catch (error) {
    res.json({ 
      title: '❌ Login Test Failed', 
      results: [{ type: 'error', message: 'Error: ' + error.message }] 
    });
  }
});

module.exports = router;