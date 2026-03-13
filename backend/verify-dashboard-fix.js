/**
 * Simple verification script for dashboard route fixes
 * Run this on cPanel to verify the routes are working
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'https://esena.co.ke'; // Change to your domain
const API_BASE = '/api';

// Test endpoints
const endpoints = [
  `${API_BASE}`,
  `${API_BASE}/admin/dashboard/stats`,
  `${API_BASE}/admin/orders?limit=5&sort=created_at&order=desc`,
  `${API_BASE}/admin/appointments?limit=4&sort=created_at&order=desc`
];

const testEndpoint = (url) => {
  return new Promise((resolve) => {
    const fullUrl = `${BASE_URL}${url}`;
    console.log(`Testing: ${fullUrl}`);
    
    const client = fullUrl.startsWith('https') ? https : http;
    
    const req = client.get(fullUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`  ✅ SUCCESS`);
        } else if (res.statusCode === 401) {
          console.log(`  ⚠️  UNAUTHORIZED (expected for protected routes)`);
        } else if (res.statusCode === 404) {
          console.log(`  ❌ NOT FOUND - Route not working`);
        } else {
          console.log(`  ⚠️  Status ${res.statusCode}`);
        }
        console.log('');
        resolve({ url, status: res.statusCode, success: res.statusCode !== 404 });
      });
    });
    
    req.on('error', (error) => {
      console.log(`  ❌ ERROR: ${error.message}`);
      console.log('');
      resolve({ url, status: 'error', success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`  ⏰ TIMEOUT`);
      console.log('');
      req.destroy();
      resolve({ url, status: 'timeout', success: false });
    });
  });
};

const runTests = async () => {
  console.log('🔍 Verifying Dashboard Route Fixes');
  console.log('=====================================\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  console.log('📊 SUMMARY');
  console.log('===========');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  
  if (successful === total) {
    console.log('🎉 All routes are working correctly!');
  } else {
    console.log('⚠️  Some routes need attention:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.url}: ${r.status}`);
    });
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. If you see 404 errors, restart your Node.js app in cPanel');
  console.log('2. If you see 401 errors for protected routes, that\'s expected');
  console.log('3. Test the dashboard in your browser after fixing any 404s');
};

runTests().catch(console.error);