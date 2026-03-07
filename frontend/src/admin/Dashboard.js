import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

/**
 * Admin dashboard overview page
 * Implements Requirements 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9
 */
const AdminDashboard = () => {
  // Placeholder statistics
  const stats = {
    pendingOrders: 12,
    pendingAppointments: 8,
    productsInStock: 156,
    totalRevenue: 15420.50
  };

  const recentOrders = [
    { id: '12345', customer: 'John Doe', total: 89.99, status: 'pending' },
    { id: '12346', customer: 'Jane Smith', total: 45.50, status: 'processing' },
    { id: '12347', customer: 'Bob Johnson', total: 120.00, status: 'dispatched' }
  ];

  const recentAppointments = [
    { id: '1', customer: 'Alice Brown', service: 'Dermatology', date: '2024-03-08', status: 'pending' },
    { id: '2', customer: 'Charlie Wilson', service: 'Lab Test', date: '2024-03-09', status: 'confirmed' },
    { id: '3', customer: 'Diana Davis', service: 'Pharmacist', date: '2024-03-10', status: 'pending' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="glass-button-secondary"
          >
            Logout
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</h3>
            <p className="text-gray-600">Pending Orders</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.pendingAppointments}</h3>
            <p className="text-gray-600">Pending Appointments</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.productsInStock}</h3>
            <p className="text-gray-600">Products in Stock</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">${stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-gray-600">Total Revenue</p>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/admin/products">
            <GlassCard className="p-6 text-center" hover>
              <h3 className="text-gray-800 mb-2">Manage Products</h3>
              <p className="text-gray-600">Add, edit, or remove products</p>
            </GlassCard>
          </Link>

          <Link to="/admin/orders">
            <GlassCard className="p-6 text-center" hover>
              <h3 className="text-gray-800 mb-2">Manage Orders</h3>
              <p className="text-gray-600">View and update order status</p>
            </GlassCard>
          </Link>

          <Link to="/admin/appointments">
            <GlassCard className="p-6 text-center" hover>
              <h3 className="text-gray-800 mb-2">Manage Appointments</h3>
              <p className="text-gray-600">View and schedule appointments</p>
            </GlassCard>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h2 className="text-gray-800 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">#{order.id}</p>
                    <p className="text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">${order.total}</p>
                    <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-gray-800 mb-4">Recent Appointments</h2>
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{appointment.customer}</p>
                    <p className="text-gray-600">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{appointment.date}</p>
                    <p className="text-sm text-gray-600 capitalize">{appointment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;