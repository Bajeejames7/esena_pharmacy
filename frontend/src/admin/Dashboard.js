import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBreakpoint } from '../utils/responsive';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import ThemeToggle from '../components/ThemeToggle';

/**
 * Enhanced admin dashboard with sidebar and statistics
 * Implements Requirements 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9
 */
const AdminDashboard = () => {
  const { breakpoint } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(breakpoint !== 'mobile');

  const adminUser = (() => { try { return JSON.parse(localStorage.getItem('adminUser') || '{}'); } catch { return {}; } })();
  const isAdmin = adminUser.role === 'admin';
  const [stats, setStats] = useState({
    pendingOrders: 0,
    pendingAppointments: 0,
    productsInStock: 0,
    totalRevenue: 0,
    loading: true,
    systemStatus: {
      database: 'unknown',
      emailService: 'unknown',
      fileStorage: 'unknown',
      api: 'unknown'
    }
  });

  const [revenueData, setRevenueData] = useState(null);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const shouldShowMenuButton = isMobile || isTablet;

  useEffect(() => {
    // Auto-collapse sidebar on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    loadDashboardStats();
    loadRecentData();
    if (isAdmin) loadRevenueData();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      
      setStats({
        pendingOrders: data.pendingOrders || 0,
        pendingAppointments: data.pendingAppointments || 0,
        productsInStock: data.productsInStock || 0,
        totalRevenue: data.totalRevenue || 0,
        revenueMonthLabel: data.revenueMonthLabel || '',
        loading: false,
        storage: data.storage || null,
        systemStatus: data.systemStatus || {
          database: 'connected',
          emailService: 'operational',
          fileStorage: '0% Used',
          api: 'healthy'
        },
        trends: data.trends || {
          orders: { trend: 'up', value: '0%' },
          appointments: { trend: 'up', value: '0%' },
          products: { trend: 'up', value: '0%' },
          revenue: { trend: 'up', value: '0%' }
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats({
        pendingOrders: 0,
        pendingAppointments: 0,
        productsInStock: 0,
        totalRevenue: 0,
        loading: false,
        systemStatus: {
          database: 'error',
          emailService: 'unknown',
          fileStorage: 'unknown',
          api: 'error'
        },
        trends: {
          orders: { trend: 'up', value: '0%' },
          appointments: { trend: 'up', value: '0%' },
          products: { trend: 'up', value: '0%' },
          revenue: { trend: 'up', value: '0%' }
        }
      });
    }
  };

  const loadRevenueData = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/dashboard/revenue`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) setRevenueData(await res.json());
    } catch { /* non-fatal */ }
  };

  const [recentOrders, setRecentOrders] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const loadRecentData = async () => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const authHeaders = {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      'Content-Type': 'application/json'
    };

    try {
      const [ordersRes, appointmentsRes, activityRes] = await Promise.allSettled([
        fetch(`${apiBase}/orders?limit=5&sort=created_at&order=desc`, { headers: authHeaders }),
        fetch(`${apiBase}/appointments?limit=5&sort=created_at&order=desc`, { headers: authHeaders }),
        fetch(`${apiBase}/admin/dashboard/activity`, { headers: authHeaders })
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const d = await ordersRes.value.json();
        setRecentOrders(d.orders || []);
      }
      if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.ok) {
        const d = await appointmentsRes.value.json();
        setRecentAppointments(d.appointments || []);
      }
      if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
        const d = await activityRes.value.json();
        setRecentActivity(d.logs || []);
      }
    } catch (error) {
      console.error('Failed to load recent data:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30';
      case 'processing': return 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30';
      case 'dispatched': return 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30';
      case 'delivered': return 'text-green-800 dark:text-green-200 bg-green-200 dark:bg-green-800/30';
      case 'confirmed': return 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/30';
    }
  };

  const StatCard = ({ icon, title, value, loading, color = 'from-glass-blue to-glass-green', trend, trendValue }) => (
    <GlassCard className="p-4 sm:p-6 text-center">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
        {icon}
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : (
        <>
          <h3 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{value}</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1 leading-tight">{title}</p>
          {trend && trendValue && (
            <div className={`flex items-center justify-center space-x-1 text-xs ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
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
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader 
        onMenuToggle={() => setSidebarOpen(true)}
        showMenuButton={shouldShowMenuButton}
      />
      
      <div className="flex flex-1">
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <div className={`flex-1 transition-all duration-300 min-w-0 ${
          !shouldShowMenuButton && sidebarOpen ? 'ml-64' : !shouldShowMenuButton ? 'ml-16' : ''
        }`}>
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 lg:block hidden">Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening today.</p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden lg:block">
                <ThemeToggle showLabel={true} />
              </div>
              
              <GlassButton
                variant="secondary"
                onClick={() => {
                  loadDashboardStats();
                  loadRecentData();
                }}
                disabled={stats.loading}
              >
                {stats.loading ? 'Refreshing...' : 'Refresh'}
              </GlassButton>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className={`grid gap-3 sm:gap-6 mb-6 sm:mb-8 ${
            isAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'
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
              color="from-glass-blue to-glass-blue-light"
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
              color="from-glass-blue-dark to-glass-blue"
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
              color="from-glass-green to-glass-green-light"
              trend={stats.trends?.products?.trend}
              trendValue={stats.trends?.products?.value}
            />

            {isAdmin && (
            <StatCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              title="Revenue"
              value={stats.loading ? '...' : `KSH ${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              loading={stats.loading}
              color="from-glass-green-dark to-glass-green"
              trend="neutral"
              trendValue={stats.revenueMonthLabel || ''}
            />
            )}
          </div>

          {/* Revenue Comparison — admin only */}
          {isAdmin && (
            <GlassCard className="p-5 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Revenue (completed orders)</h2>
                <Link to="/admin/reports" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                  Full Report →
                </Link>
              </div>

              {!revenueData ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse h-20 bg-white/20 dark:bg-slate-700/30 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">This week <span className="text-gray-400 dark:text-gray-500">({revenueData.this_week.label})</span></p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      KSh {revenueData.this_week.revenue.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{revenueData.this_week.orders} orders</p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-200 dark:border-slate-700/40 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last week <span className="text-gray-400 dark:text-gray-500">({revenueData.last_week.label})</span></p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      KSh {revenueData.last_week.revenue.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{revenueData.last_week.orders} orders</p>
                      {revenueData.week_change !== 0 && (
                        <span className={`text-xs font-semibold ml-auto ${revenueData.week_change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {revenueData.week_change > 0 ? '▲' : '▼'} {Math.abs(revenueData.week_change)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/15 to-green-600/5 border border-green-200 dark:border-green-800/40 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">This month <span className="text-gray-400 dark:text-gray-500">({revenueData.this_month.label})</span></p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      KSh {revenueData.this_month.revenue.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{revenueData.this_month.orders} orders</p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-200 dark:border-slate-700/40 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last month <span className="text-gray-400 dark:text-gray-500">({revenueData.last_month.label})</span></p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      KSh {revenueData.last_month.revenue.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{revenueData.last_month.orders} orders</p>
                      {revenueData.month_change !== 0 && (
                        <span className={`text-xs font-semibold ml-auto ${revenueData.month_change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {revenueData.month_change > 0 ? '▲' : '▼'} {Math.abs(revenueData.month_change)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {revenueData && (
                <div className="mt-3 pt-3 border-t border-white/20 dark:border-slate-700/30 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">All-time (completed orders)</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    KSh {revenueData.all_time.revenue.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">· {revenueData.all_time.orders} orders</span>
                  </span>
                </div>
              )}
            </GlassCard>
          )}

          <div className={`grid gap-4 sm:gap-6 mb-6 sm:mb-8 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
          }`}>
            <Link to="/admin/products">
              <GlassCard className="p-6 text-center h-full" hover>
                <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-gray-800 dark:text-gray-100 mb-2 font-semibold">Manage Products</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Add, edit, or remove products from inventory</p>
              </GlassCard>
            </Link>

            <Link to="/admin/orders">
              <GlassCard className="p-6 text-center h-full" hover>
                <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-800 dark:text-gray-100 mb-2 font-semibold">Manage Orders</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">View and update order status and details</p>
              </GlassCard>
            </Link>

            <Link to="/admin/appointments">
              <GlassCard className="p-6 text-center h-full" hover>
                <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6" />
                  </svg>
                </div>
                <h3 className="text-gray-800 dark:text-gray-100 mb-2 font-semibold">Manage Appointments</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">View and schedule customer appointments</p>
              </GlassCard>
            </Link>
          </div>

          {/* System Status */}
          <GlassCard className="p-6 mb-8">
            <h2 className="text-gray-800 dark:text-gray-100 font-semibold mb-4">System Status</h2>
            <div className={`grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  stats.systemStatus?.database === 'connected' ? 'bg-green-500' : 
                  stats.systemStatus?.database === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Database</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                    {stats.systemStatus?.database || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  stats.systemStatus?.emailService === 'operational' ? 'bg-green-500' : 
                  stats.systemStatus?.emailService === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Email Service</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                    {stats.systemStatus?.emailService || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  stats.storage?.percentage < 80 ? 'bg-green-500' :
                  stats.storage?.percentage < 95 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">File Storage</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {stats.systemStatus?.fileStorage || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  stats.systemStatus?.api === 'healthy' ? 'bg-green-500' : 
                  stats.systemStatus?.api === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">API</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                    {stats.systemStatus?.api || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Storage Usage */}
          {stats.storage && (
            <GlassCard className="p-6 mb-8">
              <h2 className="text-gray-800 dark:text-gray-100 font-semibold mb-4">Storage Usage</h2>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">
                    {stats.storage.usedGB >= 1
                      ? `${stats.storage.usedGB.toFixed(2)} GB used`
                      : `${stats.storage.usedMB} MB used`}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {stats.storage.quotaGB} GB total &mdash; {stats.storage.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      stats.storage.percentage < 70 ? 'bg-green-500' :
                      stats.storage.percentage < 90 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(stats.storage.percentage, 100)}%` }}
                  />
                </div>
              </div>
              <div className={`grid gap-3 mt-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {Object.entries(stats.storage.breakdown).map(([folder, data]) => (
                  <div key={folder} className="bg-white/10 dark:bg-slate-800/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">{folder}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {data.mb >= 1024
                        ? `${(data.mb / 1024).toFixed(2)} GB`
                        : `${data.mb} MB`}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <GlassCard className="p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-800 dark:text-gray-100 font-semibold">Recent Activity</h2>
                <Link to="/admin/activity-log" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                  Full Log →
                </Link>
              </div>
              <div className="space-y-2">
                {recentActivity.map(log => {
                  const actionColors = {
                    ORDER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                    APPOINTMENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                    PRESCRIPTION: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                    BLOG: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                  };
                  const colorKey = Object.keys(actionColors).find(k => log.action.startsWith(k)) || 'ORDER';
                  return (
                    <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-800/30 transition-colors">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap mt-0.5 ${actionColors[colorKey]}`}>
                        {log.resource_type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-100 truncate">
                          <span className="font-medium">{log.user_name}</span>
                          {' — '}
                          {log.description || log.action.replace(/_/g, ' ').toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                          {log.resource_id ? ` · #${log.resource_id}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {/* Recent Orders & Appointments */}
          <div className={`grid gap-4 sm:gap-6 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {/* Recent Orders */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-800 dark:text-gray-100 font-semibold">Recent Orders</h2>
                <Link to="/admin/orders" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No recent orders</p>
                  </div>
                ) : (
                  recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-white/10 dark:bg-slate-800/30 rounded-lg hover:bg-white/20 dark:hover:bg-slate-700/40 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{order.id}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{order.customer_name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">KSH {parseFloat(order.total).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Recent Appointments */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-800 dark:text-gray-100 font-semibold">Recent Appointments</h2>
                <Link to="/admin/appointments" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No recent appointments</p>
                  </div>
                ) : (
                  recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-white/10 dark:bg-slate-800/30 rounded-lg hover:bg-white/20 dark:hover:bg-slate-700/40 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{appointment.customer}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{appointment.service}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{appointment.date} at {appointment.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;