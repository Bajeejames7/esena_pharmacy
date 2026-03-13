#!/usr/bin/env node

/**
 * Comprehensive backend API diagnostic script
 * This will test all the endpoints and identify authentication issues
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://esena.co.ke';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function diagnoseBackendAPI() {
  console.log('🔍 Diagnosing Backend API Issues...\n');

  try {
    // Test 1: Check if API is responding
    console.log('1. Testing API root endpoint...');
    const rootTest = await makeRequest(`${BASE_URL}/api`);
    console.log(`   Status: ${rootTest.status}`);
    console.log(`   Response:`, rootTest.data);
    
    if (rootTest.status !== 200) {
      console.log('❌ API root endpoint not responding correctly');
    } else {
      console.log('✅ API root endpoint working');
    }

    // Test 2: Check auth endpoint availability
    console.log('\n2. Testing auth endpoint availability...');
    const authTest = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {}
    });
    console.log(`   Status: ${authTest.status}`);
    console.log(`   Response:`, authTest.data);

    // Test 3: Test with proper credentials
    console.log('\n3. Testing login with credentials...');
    const loginTest = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        username: 'admin',
        password: 'password'
      }
    });
    console.log(`   Status: ${loginTest.status}`);
    console.log(`   Response:`, loginTest.data);

    if (loginTest.status === 200 && loginTest.data.token) {
      console.log('✅ Login successful! Token received.');
      
      // Test 4: Test protected endpoint with token
      console.log('\n4. Testing protected endpoint with token...');
      const dashboardTest = await makeRequest(`${BASE_URL}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${loginTest.data.token}`
        }
      });
      console.log(`   Status: ${dashboardTest.status}`);
      console.log(`   Response:`, dashboardTest.data);
      
      if (dashboardTest.status === 200) {
        console.log('✅ Protected endpoint working with authentication');
      } else {
        console.log('❌ Protected endpoint still failing');
      }
    } else {
      console.log('❌ Login failed');
      
      // Test 5: Check database connection
      console.log('\n5. Testing database connection...');
      const dbTest = await makeRequest(`${BASE_URL}/db-test`);
      console.log(`   Status: ${dbTest.status}`);
      console.log(`   Response:`, dbTest.data);
    }

    // Test 6: Check available routes
    console.log('\n6. Checking available routes...');
    const routesTest = await makeRequest(`${BASE_URL}/debug/routes`);
    console.log(`   Status: ${routesTest.status}`);
    if (routesTest.status === 200) {
      console.log('   Available routes:', routesTest.data.routes?.slice(0, 10) || 'None found');
    }

    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('====================');
    
    if (rootTest.status === 200) {
      console.log('✅ Backend API is running');
    } else {
      console.log('❌ Backend API is not responding');
      return;
    }

    if (loginTest.status === 200) {
      console.log('✅ Authentication is working');
      console.log('✅ The 401 errors should be resolved');
    } else if (loginTest.status === 400) {
      console.log('❌ Login endpoint returning 400 Bad Request');
      console.log('   Possible causes:');
      console.log('   - Missing or invalid request body');
      console.log('   - Database connection issues');
      console.log('   - Missing admin user in database');
      console.log('   - Validation errors');
    } else if (loginTest.status === 500) {
      console.log('❌ Server error during login');
      console.log('   Check server logs for detailed error information');
    } else {
      console.log(`❌ Unexpected login response: ${loginTest.status}`);
    }

    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('======================');
    
    if (loginTest.status !== 200) {
      console.log('1. Run the admin user setup script:');
      console.log('   cd backend && node setup-admin-user.js');
      console.log('');
      console.log('2. Check server logs for detailed error messages');
      console.log('');
      console.log('3. Verify database connection and admin user exists');
      console.log('');
      console.log('4. Test the fix script:');
      console.log('   node fix-admin-auth.js');
    } else {
      console.log('✅ Authentication appears to be working correctly!');
      console.log('   The frontend should now work without 401 errors.');
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    console.log('\nThis could indicate:');
    console.log('- Network connectivity issues');
    console.log('- Backend server is not running');
    console.log('- SSL/TLS certificate issues');
  }
}

// Run the diagnosis
diagnoseBackendAPI();