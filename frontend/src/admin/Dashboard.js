import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBreakpoint } from '../utils/responsive';
import AdminSidebar from '../components/AdminSidebar';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';

/**
 * Enhanced admin dashboard with sidebar and statistics
 * Implements Requirements 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9
 */
const AdminDashboard = () => {
  const { breakpoint } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(breakpoint !== 'mobile');
  const [stats, setStats] = useState({
    pendingOrders: 0,
    pendingAppointments: 0,
    productsInStock: 0,
    totalRevenue: 0,
    loading: true
  });

  const isMobile = breakpoint === 'mobile';

  useEffect(() => {
    // Auto-collapse sidebar on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Load dashboard statistics
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await statsAPI.getDashboard();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo data with some randomization and trends
      const pendingOrders = Math.floor(Math.random() * 20) + 5;
      const pendingAppointments = Math.floor(Math.random() * 15) + 3;
      const productsInStock = Math.floor(Math.random() * 50) + 150;
      const totalRevenue = (Math.random() * 10000) + 15000;
      
      setStats({
        pendingOrders,
        pendingAppointments,
        productsInStock,
        totalRevenue,
        loading: false,
        trends: {
          orders: { trend: 'up', value: '+12%' },
          appointments: { trend: 'up', value: '+8%' },
          products: { trend: 'down', value: '-3%' },
          revenue: { trend: 'up', value: '+15%' }
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const recentOrders = [
    { id: 'ORD-12345', customer: 'John Doe', total: 89.99, status: 'pending', date: '2024-03-07' },
    { id: 'ORD-12346', customer: 'Jane Smith', total: 45.50, status: 'processing', date: '2024-03-07' },
    { id: 'ORD-12347', customer: 'Bob Johnson', total: 120.00, status: 'dispatched', date: '2024-03-06' },
    { id: 'ORD-12348', customer: 'Alice Brown', total: 67.25, status: 'delivered', date: '2024-03-06' },
    { id: 'ORD-12349', customer: 'Charlie Wilson', total: 34.99, status: 'pending', date: '2024-03-05' }
  ];

  const recentAppointments = [
    { id: 'APT-001', customer: 'Alice Brown', service: 'Dermatology', date: '2024-03-08', time: '10:00 AM', status: 'pending' },
    { id: 'APT-002', customer: 'Charlie Wilson', service: 'Lab Test', date: '2024-03-09', time: '2:00 PM', status: 'confirmed' },
    { id: 'APT-003', customer: 'Diana Davis', service: 'Pharmacist', date: '2024-03-10', time: '11:30 AM', status: 'pending' },
    { id: 'APT-004', customer: 'Eva Martinez', service: 'Vaccination', date: '2024-03-11', time: '9:00 AM', status: 'confirmed' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'dispatched': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-green-800 bg-green-200';
      case 'confirmed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard = ({ icon, title, value, loading, color = 'from-glass-blue to-glass-green', trend, trendValue }) => (
    <GlassCard className="p-6 text-center">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
          <p className="text-gray-600 mb-2">{title}</p>
          {trend && trendValue && (
            <div className={`flex items-center justify-center space-x-1 text-xs ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              ) : trend === 'down' ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                </svg>
              ) : null}
              <span>{trendValue}</span>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white flex">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className={`flex-1 transition-all duration-300 ${
        !isMobile && sidebarOpen ? 'ml-64' : !isMobile ? 'ml-16' : ''
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
              </div>
            </div>
            
            <GlassButton
              variant="secondary"
              onClick={loadDashboardStats}
              disabled={stats.loading}
            >
              {stats.loading ? 'Refreshing...' : 'Refresh'}
            </GlassButton>
          </div>

          {/* Statistics Cards */}
          <div className={`grid gap-6 mb-8 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
          }`}>
            <StatCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Pending Orders"
              value={stats.loading ? '...' : stats.pendingOrders}
              loading={stats.loading}
              color="from-yellow-400 to-orange-500"
              trend={stats.trends?.orders?.trend}
              trendValue={stats.trends?.orders?.value}
            />

            <StatCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6" />
                </svg>
              }
              title="Pending Appointments"
              value={stats.loading ? '...' : stats.pendingAppointments}
              loading={stats.loading}
              color="from-blue-400 to-purple-500"
              trend={stats.trends?.appointments?.trend}
              trendValue={stats.trends?.appointments?.value}
            />

            <StatCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              title="Products in Stock"
              value={stats.loading ? '...' : stats.productsInStock}
              loading={stats.loading}
              color="from-green-400 to-teal-500"
              trend={stats.trends?.products?.trend}
              trendValue={stats.trends?.products?.value}
            />

            <StatCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              title="Total Revenue"
              value={stats.loading ? '...' : `$${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              loading={stats.loading}
              color="from-emerald-400 to-green-600"
              trend={stats.trends?.revenue?.trend}
              trendValue={stats.trends?.revenue?.value}
            />
          </div>

          {/* Quick Actions */}
          <div className={`grid gap-6 mb-8 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
          }`}>
            <Link to="/admin/products">
              <GlassCard className="p-6 text-center h-full" hover>
                <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-gray-800 mb-2 font-semibold">Manage Products</h3>
                <p className="text-gray-600 text-sm">Add, edit, or remove products from inventory</p>
              </GlassCard>
            </Link>

            <Link to="/admin/orders">
              <GlassCard className="p-6 text-center h-full" hover>
                <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-800 mb-2 font-semibold">Manage Orders</h3>
                <p className="text-gray-600 text-sm">View and update order status and details</p>
              </GlassCard>
            </Link>

            <Link to="/admin/appointments">
              <GlassCard className="p-6 text-center h-full" hover>
                <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6" />
                  </svg>
                </div>
                <h3 className="text-gray-800 mb-2 font-semibold">Manage Appointments</h3>
                <p className="text-gray-600 text-sm">View and schedule customer appointments</p>
              </GlassCard>
            </Link>
          </div>

          {/* System Status */}
          <GlassCard className="p-6 mb-8">
            <h2 className="text-gray-800 font-semibold mb-4">System Status</h2>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Database</p>
                  <p className="text-xs text-gray-600">Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Email Service</p>
                  <p className="text-xs text-gray-600">Operational</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">File Storage</p>
                  <p className="text-xs text-gray-600">85% Used</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">API</p>
                  <p className="text-xs text-gray-600">Healthy</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <div className={`grid gap-6 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {/* Recent Orders */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-800 font-semibold">Recent Orders</h2>
                <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-800 text-sm">{order.id}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{order.customer}</p>
                      <p className="text-gray-500 text-xs">{order.date}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-800">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Recent Appointments */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-800 font-semibold">Recent Appointments</h2>
                <Link to="/admin/appointments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-800 text-sm">{appointment.customer}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{appointment.service}</p>
                      <p className="text-gray-500 text-xs">{appointment.date} at {appointment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;