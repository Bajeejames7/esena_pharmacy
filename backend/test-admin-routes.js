/**
 * Quick test to verify admin routes are working
 * Run this locally to test before deploying
 */

const express = require('express');
const cors = require('cors');

// Create a minimal test server with just the routes we need
const app = express();

app.use(cors());
app.use(express.json());

// Import and test the routes
console.log('Testing route imports...');

try {
  const ordersRoutes = require('./routes/orders');
  const appointmentsRoutes = require('./routes/appointments');
  const dashboardRoutes = require('./routes/dashboard');
  
  console.log('✅ All routes imported successfully');
  
  // Set up the routes exactly as in server.js
  app.use(["/orders", "/api/orders", "/admin/orders", "/api/admin/orders"], ordersRoutes);
  app.use(["/appointments", "/api/appointments", "/admin/appointments", "/api/admin/appointments"], appointmentsRoutes);
  app.use(["/admin/dashboard", "/api/admin/dashboard"], dashboardRoutes);
  
  // Explicit fallback routes
  app.use("/api/admin/orders", ordersRoutes);
  app.use("/api/admin/appointments", appointmentsRoutes);
  app.use("/api/admin/dashboard", dashboardRoutes);
  
  console.log('✅ Routes registered');
  
} catch (error) {
  console.error('❌ Route import failed:', error.message);
  process.exit(1);
}

// Test endpoints
const testRoutes = [
  { method: 'GET', path: '/api/admin/dashboard/stats', description: 'Dashboard stats' },
  { method: 'GET', path: '/api/admin/orders', description: 'Admin orders list' },
  { method: 'GET', path: '/api/admin/appointments', description: 'Admin appointments list' },
  { method: 'GET', path: '/admin/orders', description: 'Admin orders (no api prefix)' },
  { method: 'GET', path: '/admin/appointments', description: 'Admin appointments (no api prefix)' }
];

// Start test server
const server = app.listen(3002, () => {
  console.log('\n🚀 Test server running on port 3002');
  console.log('Testing routes...\n');
  
  const http = require('http');
  let testCount = 0;
  
  testRoutes.forEach((route, index) => {
    setTimeout(() => {
      const req = http.get(`http://localhost:3002${route.path}`, (res) => {
        const status = res.statusCode;
        let statusIcon = '❌';
        let statusText = 'NOT FOUND';
        
        if (status === 200) {
          statusIcon = '✅';
          statusText = 'OK';
        } else if (status === 401) {
          statusIcon = '🔒';
          statusText = 'AUTH REQUIRED (Expected)';
        } else if (status === 500) {
          statusIcon = '⚠️';
          statusText = 'SERVER ERROR';
        }
        
        console.log(`${statusIcon} ${route.method} ${route.path} - ${status} ${statusText}`);
        console.log(`   ${route.description}`);
        
        testCount++;
        if (testCount === testRoutes.length) {
          console.log('\n✅ Route testing completed');
          server.close();
          process.exit(0);
        }
      });
      
      req.on('error', (err) => {
        console.log(`❌ ${route.method} ${route.path} - ERROR: ${err.message}`);
        testCount++;
        if (testCount === testRoutes.length) {
          server.close();
          process.exit(0);
        }
      });
      
      req.setTimeout(3000, () => {
        req.destroy();
        console.log(`⏰ ${route.method} ${route.path} - TIMEOUT`);
        testCount++;
        if (testCount === testRoutes.length) {
          server.close();
          process.exit(0);
        }
      });
      
    }, index * 500); // Stagger requests
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});