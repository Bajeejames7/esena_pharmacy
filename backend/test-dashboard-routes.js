const express = require('express');
const request = require('supertest');

// Test the dashboard routes to verify they work
const testDashboardRoutes = async () => {
  console.log('Testing Dashboard Routes...');
  
  // Import the app
  const app = require('./server.js');
  
  try {
    // Test 1: Root API endpoint
    console.log('\n1. Testing root API endpoint...');
    const rootResponse = await request(app).get('/api');
    console.log('Status:', rootResponse.status);
    console.log('Response:', rootResponse.body);
    
    // Test 2: Dashboard stats endpoint
    console.log('\n2. Testing dashboard stats endpoint...');
    const statsResponse = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', 'Bearer test-token'); // Mock token for testing
    console.log('Status:', statsResponse.status);
    console.log('Response:', statsResponse.body);
    
    // Test 3: Admin orders endpoint with query params
    console.log('\n3. Testing admin orders endpoint...');
    const ordersResponse = await request(app)
      .get('/api/admin/orders?limit=5&sort=created_at&order=desc')
      .set('Authorization', 'Bearer test-token');
    console.log('Status:', ordersResponse.status);
    console.log('Response:', ordersResponse.body);
    
    // Test 4: Admin appointments endpoint with query params
    console.log('\n4. Testing admin appointments endpoint...');
    const appointmentsResponse = await request(app)
      .get('/api/admin/appointments?limit=4&sort=created_at&order=desc')
      .set('Authorization', 'Bearer test-token');
    console.log('Status:', appointmentsResponse.status);
    console.log('Response:', appointmentsResponse.body);
    
    console.log('\n✅ Route testing completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
  
  process.exit(0);
};

// Run the test
testDashboardRoutes();