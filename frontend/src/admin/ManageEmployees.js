import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import { useBreakpoint } from '../utils/responsive';

const API = process.env.REACT_APP_API_URL || 'https://esena.co.ke/api';
const token = () => localStorage.getItem('adminToken');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const EMPTY_FORM = { username: '', email: '', full_name: '', phone: '', role: 'employee' };

const ManageEmployees = () => {
  const { breakpoint } = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !isTablet);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [logFilter, setLogFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/employees`, { headers: headers() });
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const loadLog = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/employees/activity-log?limit=200`, { headers: headers() });
      const data = await res.json();
      setActivityLog(data.logs || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setFormError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      const url = editId ? `${API}/admin/employees/${editId}` : `${API}/admin/employees`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null);
      load();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const toggleStatus = async (emp) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    await fetch(`${API}/admin/employees/${emp.id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify({ status: newStatus })
    });
    load();
  };

  const resendOTP = async (emp) => {
    const res = await fetch(`${API}/admin/employees/${emp.id}/resend-otp`, { method: 'POST', headers: headers() });
    const data = await res.json();
    alert(data.message);
  };

  const deleteEmployee = async (emp) => {
    if (!window.confirm(`Delete ${emp.full_name || emp.username}? This cannot be undone.`)) return;
    await fetch(`${API}/admin/employees/${emp.id}`, { method: 'DELETE', headers: headers() });
    load();
  };

  const openEdit = (emp) => {
    setEditId(emp.id);
    setForm({ username: emp.username, email: emp.email || '', full_name: emp.full_name || '', phone: emp.phone || '', role: emp.role });
    setShowForm(true);
  };

  const statusBadge = (status) => {
    const map = { active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || ''}`}>{status}</span>;
  };

  const filteredLog = activityLog.filter(l =>
    !logFilter || l.resource_type === logFilter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader onMenuToggle={() => setSidebarOpen(true)} showMenuButton={isMobile || isTablet} />
      <div className="flex flex-1">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 transition-all duration-300 ${!(isMobile || isTablet) && sidebarOpen ? 'ml-64' : !(isMobile || isTablet) ? 'ml-16' : ''}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Employees</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage staff accounts and permissions</p>
              </div>
              <div className="flex gap-3">
                <GlassButton variant="secondary" onClick={() => { setShowLog(!showLog); if (!showLog) loadLog(); }}>
                  {showLog ? 'Hide Log' : 'Activity Log'}
                </GlassButton>
                <GlassButton onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
                  + Add Employee
                </GlassButton>
              </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <GlassCard className="p-6 mb-6">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{editId ? 'Edit Employee' : 'New Employee'}</h2>
                <form onSubmit={handleSubmit} className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <GlassInput label="Full Name" value={form.full_name} onChange={set('full_name')} required placeholder="Jane Doe" />
                  <GlassInput label="Username" value={form.username} onChange={set('username')} required placeholder="janedoe" disabled={!!editId} />
                  <GlassInput label="Email" type="email" value={form.email} onChange={set('email')} required={!editId} placeholder="jane@example.com" />
                  <GlassInput label="Phone" value={form.phone} onChange={set('phone')} placeholder="0712345678" />
                  <GlassSelect label="Role" value={form.role} onChange={set('role')}>
                    <option value="employee">Employee</option>
                    <option value="doctor">Doctor</option>
                  </GlassSelect>
                  <div className="flex items-end gap-3">
                    <GlassButton type="submit" loading={formLoading} disabled={formLoading}>
                      {editId ? 'Save Changes' : 'Create & Send Invite'}
                    </GlassButton>
                    <GlassButton type="button" variant="secondary" onClick={() => { setShowForm(false); setEditId(null); }}>
                      Cancel
                    </GlassButton>
                  </div>
                </form>
                {formError && <p className="mt-3 text-red-600 dark:text-red-400 text-sm">{formError}</p>}
              </GlassCard>
            )}

            {/* Employee List */}
            <GlassCard className="p-6 mb-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : employees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No employees yet. Add one above.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20 dark:border-slate-700">
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium">Name</th>
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium">Username</th>
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium hidden md:table-cell">Email</th>
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium">Role</th>
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium">Status</th>
                        <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-medium hidden lg:table-cell">Last Login</th>
                        <th className="text-right py-3 px-2 text-gray-600 dark:text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id} className="border-b border-white/10 dark:border-slate-800 hover:bg-white/10 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-2 text-gray-800 dark:text-gray-100 font-medium">{emp.full_name || '—'}</td>
                          <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{emp.username}</td>
                          <td className="py-3 px-2 text-gray-600 dark:text-gray-300 hidden md:table-cell">{emp.email || '—'}</td>
                          <td className="py-3 px-2 capitalize text-gray-600 dark:text-gray-300">{emp.role}</td>
                          <td className="py-3 px-2">{statusBadge(emp.status)}</td>
                          <td className="py-3 px-2 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">
                            {emp.last_login ? new Date(emp.last_login).toLocaleString() : 'Never'}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex justify-end gap-2 flex-wrap">
                              <button onClick={() => openEdit(emp)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs">Edit</button>
                              <button onClick={() => toggleStatus(emp)} className={`text-xs hover:underline ${emp.status === 'active' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              {emp.status === 'pending' && (
                                <button onClick={() => resendOTP(emp)} className="text-yellow-600 dark:text-yellow-400 hover:underline text-xs">Resend OTP</button>
                              )}
                              <button onClick={() => deleteEmployee(emp)} className="text-red-600 dark:text-red-400 hover:underline text-xs">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>

            {/* Activity Log */}
            {showLog && (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100">Activity Log</h2>
                  <select
                    value={logFilter}
                    onChange={e => setLogFilter(e.target.value)}
                    className="text-sm bg-white/20 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-200"
                  >
                    <option value="">All resources</option>
                    <option value="order">Orders</option>
                    <option value="appointment">Appointments</option>
                    <option value="prescription">Prescriptions</option>
                    <option value="blog">Blogs</option>
                  </select>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white/80 dark:bg-slate-900/80">
                      <tr className="border-b border-white/20 dark:border-slate-700">
                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-300 font-medium">Time</th>
                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-300 font-medium">Employee</th>
                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-300 font-medium">Action</th>
                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-300 font-medium">Resource</th>
                        <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-300 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLog.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-6 text-gray-500">No activity yet</td></tr>
                      ) : filteredLog.map(log => (
                        <tr key={log.id} className="border-b border-white/10 dark:border-slate-800">
                          <td className="py-2 px-2 text-gray-500 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{log.user_name}</td>
                          <td className="py-2 px-2 text-gray-600 dark:text-gray-400 text-xs">{log.action.replace(/_/g, ' ')}</td>
                          <td className="py-2 px-2 text-gray-600 dark:text-gray-400 text-xs capitalize">{log.resource_type} #{log.resource_id}</td>
                          <td className="py-2 px-2 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">{log.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEmployees;
