import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import { useBreakpoint } from '../utils/responsive';

const API = process.env.REACT_APP_API_URL || 'https://esena.co.ke/api';
const token = () => localStorage.getItem('adminToken');
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const AdminProfile = () => {
  const { breakpoint } = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !isTablet);

  const [form, setForm] = useState({ username: '', email: '', current_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
      setForm(f => ({ ...f, username: user.username || '', email: user.email || '' }));
    } catch {}
  }, []);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password && form.new_password !== form.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      const body = { username: form.username, email: form.email };
      if (form.current_password) body.current_password = form.current_password;
      if (form.new_password) body.new_password = form.new_password;

      const res = await fetch(`${API}/auth/profile`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      // Update local storage
      const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
      localStorage.setItem('adminUser', JSON.stringify({ ...user, username: form.username, email: form.email }));

      setSuccess('Profile updated successfully.');
      setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader onMenuToggle={() => setSidebarOpen(true)} showMenuButton={isMobile || isTablet} />
      <div className="flex flex-1">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 transition-all duration-300 ${!(isMobile || isTablet) && sidebarOpen ? 'ml-64' : !(isMobile || isTablet) ? 'ml-16' : ''}`}>
          <div className="p-6 max-w-lg">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Profile</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Update your username, email, or password</p>
            </div>

            <GlassCard className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <GlassInput
                  label="Username"
                  value={form.username}
                  onChange={set('username')}
                  required
                  placeholder="admin"
                />
                <GlassInput
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="admin@example.com"
                />

                <hr className="border-white/20 dark:border-slate-700 my-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Leave password fields blank to keep your current password.</p>

                <GlassInput
                  label="Current Password"
                  type="password"
                  value={form.current_password}
                  onChange={set('current_password')}
                  placeholder="Required to change password"
                  autoComplete="current-password"
                />
                <GlassInput
                  label="New Password"
                  type="password"
                  value={form.new_password}
                  onChange={set('new_password')}
                  placeholder="New password"
                  autoComplete="new-password"
                />
                <GlassInput
                  label="Confirm New Password"
                  type="password"
                  value={form.confirm_password}
                  onChange={set('confirm_password')}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />

                {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
                {success && <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>}

                <GlassButton type="submit" loading={loading} disabled={loading}>
                  Save Changes
                </GlassButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
