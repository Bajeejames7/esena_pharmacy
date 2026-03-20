import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import ThemeToggle from '../components/ThemeToggle';
import { useBreakpoint } from '../utils/responsive';

const API = process.env.REACT_APP_API_URL || 'https://esena.co.ke/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`
});

const ACTION_COLORS = {
  ORDER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  APPOINTMENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  PRESCRIPTION: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  BLOG: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  EMPLOYEE: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  PRODUCT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  LOGIN: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  LOGOUT: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  PASSWORD: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  PROFILE: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

const getActionColor = (action = '') => {
  const key = Object.keys(ACTION_COLORS).find(k => action.startsWith(k));
  return ACTION_COLORS[key] || 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-300';
};

const PAGE_SIZE = 20;

const ActivityLog = () => {
  const { breakpoint } = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !isTablet);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        ...(resourceFilter && { resource_type: resourceFilter }),
        ...(search && { search }),
      });
      const res = await fetch(`${API}/admin/employees/activity-log?${params}`, { headers: authHeaders() });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, resourceFilter, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, resourceFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatTime = (ts) => {
    const d = new Date(ts);
    if (isMobile) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
        d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader onMenuToggle={() => setSidebarOpen(true)} showMenuButton={isMobile || isTablet} />
      <div className="flex flex-1 min-w-0">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 min-w-0 transition-all duration-300 ${!(isMobile || isTablet) && sidebarOpen ? 'ml-64' : !(isMobile || isTablet) ? 'ml-16' : ''}`}>
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>

            {/* Page header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`font-bold text-gray-800 dark:text-gray-100 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Activity Log</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">All staff actions across the system</p>
              </div>
              <div className="flex items-center gap-2">
                {!isMobile && <div className="hidden lg:block"><ThemeToggle showLabel={true} /></div>}
                <GlassButton variant="secondary" onClick={load} disabled={loading} size={isMobile ? 'sm' : 'md'}>
                  {loading ? '...' : 'Refresh'}
                </GlassButton>
              </div>
            </div>

            {/* Filters */}
            <GlassCard className={`${isMobile ? 'p-3' : 'p-4'} mb-4`}>
              <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row items-center'}`}>
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={isMobile ? 'Search...' : 'Search by employee, action, or description...'}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white/20 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
                <select
                  value={resourceFilter}
                  onChange={e => setResourceFilter(e.target.value)}
                  className="bg-white/20 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                  <option value="">All resources</option>
                  <option value="order">Orders</option>
                  <option value="appointment">Appointments</option>
                  <option value="prescription">Prescriptions</option>
                  <option value="blog">Blogs</option>
                  <option value="product">Products</option>
                  <option value="employee">Employees</option>
                  <option value="auth">Auth / Login</option>
                </select>
                {(search || resourceFilter) && (
                  <GlassButton variant="secondary" size="sm" onClick={() => { setSearch(''); setResourceFilter(''); }}>
                    Clear
                  </GlassButton>
                )}
              </div>
            </GlassCard>

            {/* Log content */}
            <GlassCard className={`${isMobile ? 'p-3' : 'p-6'}`}>
              {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">No activity found</div>
              ) : isMobile ? (
                /* ── Mobile: card list ── */
                <div className="space-y-3">
                  {logs.map(log => (
                    <div key={log.id} className="bg-white/10 dark:bg-slate-800/30 rounded-lg p-3 border border-white/10 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 text-right">{formatTime(log.created_at)}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{log.user_name || '—'}</p>
                      {log.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{log.description}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">{log.resource_type}{log.resource_id ? ` #${log.resource_id}` : ''}</p>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── Tablet/Desktop: table ── */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20 dark:border-slate-700">
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">Time</th>
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium">Employee</th>
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium">Action</th>
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium">Resource</th>
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium hidden lg:table-cell">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id} className="border-b border-white/10 dark:border-slate-800 hover:bg-white/10 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-2 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{formatTime(log.created_at)}</td>
                          <td className="py-3 px-2 text-gray-800 dark:text-gray-100 font-medium">{log.user_name || '—'}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-600 dark:text-gray-400 text-xs capitalize">
                            {log.resource_type}{log.resource_id ? ` #${log.resource_id}` : ''}
                          </td>
                          <td className="py-3 px-2 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell max-w-xs truncate">
                            {log.description || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination — always show when there's data */}
              {total > 0 && (
                <div className={`flex items-center justify-between mt-4 pt-4 border-t border-white/20 dark:border-slate-700 ${isMobile ? 'flex-col gap-3' : ''}`}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {total} entries · page {page} of {totalPages || 1}
                  </p>
                  <div className="flex gap-2">
                    <GlassButton variant="secondary" size="sm" onClick={() => setPage(1)} disabled={page === 1}>
                      «
                    </GlassButton>
                    <GlassButton variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                      ← Prev
                    </GlassButton>
                    <GlassButton variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                      Next →
                    </GlassButton>
                    <GlassButton variant="secondary" size="sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
                      »
                    </GlassButton>
                  </div>
                </div>
              )}
            </GlassCard>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
