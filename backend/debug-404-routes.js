/**
 * Debug script to test the exact failing routes
 * This will help identify why the 404s are still happening
 */

const express = require('express');
const app = express();

// Import all the route modules to test them
console.log('🔍 Testing Route Imports...');

try {
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes imported successfully');
} catch (e) {
  console.log('❌ Auth routes failed:', e.message);
}

try {
  const dashboardRoutes = require('./routes/dashboard');
  console.log('✅ Dashboard routes imported successfully');
} catch (e) {
  console.log('❌ Dashboard routes failed:', e.message);
}

try {
  const ordersRoutes = require('./routes/orders');
  console.log('✅ Orders routes imported successfully');
} catch (e) {
  console.log('❌ Orders routes failed:', e.message);
}

try {
  const appointmentsRoutes = require('./routes/appointments');
  console.log('✅ Appointments routes imported successfully');
} catch (e) {
  console.log('❌ Appointments routes failed:', e.message);
}

// Test the exact route patterns from server.js
console.log('\n🔍 Testing Route Patterns...');

// Simulate the route setup
app.use(express.json());

// Test the exact patterns from your server.js
const routePatterns = [
  { paths: ["/auth", "/api/auth"], module: './routes/auth' },
  { paths: ["/products", "/api/products"], module: './routes/products' },
  { paths: ["/orders", "/api/orders", "/admin/orders", "/api/admin/orders"], module: './routes/orders' },
  { paths: ["/appointments", "/api/appointments", "/admin/appointments", "/api/admin/appointments"], module: './routes/appointments' },
  { paths: ["/contact", "/api/contact"], module: './routes/contact' },
  { paths: ["/blogs", "/api/blogs"], module: './routes/blogs' },
  { paths: ["/admin/dashboard", "/api/admin/dashboard"], module: './routes/dashboard' }
];

routePatterns.forEach(({ paths, module }) => {
  try {
    const routeModule = require(module);
    app.use(paths, routeModule);
    console.log(`✅ Registered paths: ${paths.join(', ')}`);
  } catch (e) {
    console.log(`❌ Failed to register ${module}:`, e.message);
  }
});

// Test specific failing endpoints
console.log('\n🔍 Testing Specific Endpoints...');

const testEndpoints = [
  '/api/admin/dashboard/stats',
  '/api/admin/orders',
  '/api/admin/appointments',
  '/admin/dashboard/stats',
  '/admin/orders',
  '/admin/appointments'
];

// Start server for testing
const server = app.listen(3001, () => {
  console.log('Test server started on port 3001');
  
  // Test each endpoint
  testEndpoints.forEach(endpoint => {
    const http = require('http');
    
    const req = http.get(`http://localhost:3001${endpoint}`, (res) => {
      console.log(`${endpoint}: Status ${res.statusCode}`);
      if (res.statusCode === 404) {
        console.log(`  ❌ Route not found for ${endpoint}`);
      } else if (res.statusCode === 401) {
        console.log(`  ⚠️  Authentication required for ${endpoint} (this is expected)`);
      } else {
        console.log(`  ✅ Route exists for ${endpoint}`);
      }
    });
    
    req.on('error', (err) => {
      console.log(`${endpoint}: Error - ${err.message}`);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
    });
  });
  
  // Close server after tests
  setTimeout(() => {
    server.close();
    console.log('\n✅ Route testing completed');
    process.exit(0);
  }, 5000);
});