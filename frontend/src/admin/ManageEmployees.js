import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import ThemeToggle from '../components/ThemeToggle';
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
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/employees`, { headers: headers() });
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setFormError(''); };  const handleSubmit = async (e) => {
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

  const q = search.toLowerCase();
  const filteredEmployees = employees.filter(emp =>
    !q ||
    (emp.full_name || '').toLowerCase().includes(q) ||
    emp.username.toLowerCase().includes(q) ||
    (emp.email || '').toLowerCase().includes(q) ||
    emp.role.toLowerCase().includes(q)
  );  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader onMenuToggle={() => setSidebarOpen(true)} showMenuButton={isMobile || isTablet} />
      <div className="flex flex-1 min-w-0">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 min-w-0 transition-all duration-300 ${!(isMobile || isTablet) && sidebarOpen ? 'ml-64' : !(isMobile || isTablet) ? 'ml-16' : ''}`}>
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Employees</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage staff accounts and permissions</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden lg:block">
                  <ThemeToggle showLabel={true} />
                </div>
                <GlassButton onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
                  + Add Employee
                </GlassButton>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, username, email or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/20 dark:bg-slate-800/50 border border-white/30 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <GlassCard className="p-6 mb-6">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{editId ? 'Edit Employee' : 'New Employee'}</h2>
                <form onSubmit={handleSubmit} className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <GlassInput label="Full Name" value={form.full_name} onChange={set('full_name')} required placeholder="Jane Doe" />
                  <GlassInput label="Username" value={form.username} onChange={set('username')} required placeholder="janedoe" />
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
            <GlassCard className={`${isMobile ? 'p-3' : 'p-6'} mb-6`}>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">{search ? 'No employees match your search.' : 'No employees yet. Add one above.'}</div>
              ) : isMobile ? (
                /* ── Mobile: card list ── */
                <div className="space-y-3">
                  {filteredEmployees.map(emp => (
                    <div key={emp.id} className="bg-white/10 dark:bg-slate-800/30 rounded-lg p-3 border border-white/10 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{emp.full_name || emp.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{emp.username} · <span className="capitalize">{emp.role}</span></p>
                        </div>
                        {statusBadge(emp.status)}
                      </div>
                      {emp.email && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{emp.email}</p>}
                      <div className="flex gap-3 flex-wrap pt-1 border-t border-white/10 dark:border-slate-700">
                        <button onClick={() => openEdit(emp)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs">Edit</button>
                        <button onClick={() => toggleStatus(emp)} className={`text-xs hover:underline ${emp.status === 'active' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        {emp.status === 'pending' && (
                          <button onClick={() => resendOTP(emp)} className="text-yellow-600 dark:text-yellow-400 hover:underline text-xs">Resend OTP</button>
                        )}
                        <button onClick={() => deleteEmployee(emp)} className="text-red-600 dark:text-red-400 hover:underline text-xs">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── Tablet/Desktop: table ── */
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
                      {filteredEmployees.map(emp => (
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

          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEmployees;
