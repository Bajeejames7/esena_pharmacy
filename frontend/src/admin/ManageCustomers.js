import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import GlassCard from '../components/GlassCard';
import ThemeToggle from '../components/ThemeToggle';
import { useBreakpoint } from '../utils/responsive';
import api from '../services/api';

const ManageCustomers = () => {
  const { breakpoint } = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !isTablet);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/customers/admin/list')
      .then(res => setCustomers(res.data.customers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Manage Customers"
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Registered Customers</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage and view customer accounts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
              />
            </div>
          </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-8 text-center text-gray-500 dark:text-gray-400">
          {search ? 'No customers match your search.' : 'No registered customers yet.'}
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/10 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300 text-left">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Provider</th>
                  <th className="px-4 py-3 font-semibold text-right">Orders</th>
                  <th className="px-4 py-3 font-semibold text-right">Total Spent</th>
                  <th className="px-4 py-3 font-semibold">Last Order</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-gray-700/40">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.profile_picture ? (
                          <img src={c.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {c.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{c.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.auth_provider === 'google'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {c.auth_provider === 'google' ? 'Google' : 'Email'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-medium">
                      {c.order_count}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">
                      KSh {parseFloat(c.total_spent || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {c.last_order_at
                        ? new Date(c.last_order_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-white/10 dark:border-gray-700/40 text-xs text-gray-500 dark:text-gray-400">
            {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </div>
        </GlassCard>
      )}
        </main>
      </div>
    </div>
  );
};

export default ManageCustomers;
