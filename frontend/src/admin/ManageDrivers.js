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

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  password: '',
  national_id: '',
  license_number: '',
  vehicle_type: 'bike',
  vehicle_registration: '',
  status: 'active'
};

const ManageDrivers = () => {
  const { breakpoint } = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !isTablet);

  const [drivers, setDrivers] = useState([]);
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
      const res = await fetch(`${API}/drivers/admin/list`, { headers: headers() });
      const data = await res.json();
      setDrivers(data.drivers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const url = editId
        ? `${API}/drivers/admin/${editId}`
        : `${API}/drivers/admin/register`;
      const method = editId ? 'PUT' : 'POST';

      // Don't send password if editing and password field is empty
      const body = { ...form };
      if (editId && !body.password) {
        delete body.password;
      }

      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Operation failed');
        return;
      }

      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      load();
    } catch (err) {
      setFormError('Network error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (driver) => {
    setForm({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || '',
      password: '', // Don't pre-fill password
      national_id: driver.national_id || '',
      license_number: driver.license_number || '',
      vehicle_type: driver.vehicle_type,
      vehicle_registration: driver.vehicle_registration || '',
      status: driver.status
    });
    setEditId(driver.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditId(null);
    setFormError('');
  };

  const filtered = drivers.filter(d =>
    !search ||
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.phone?.includes(search) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.vehicle_registration?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Manage Drivers"
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                Delivery Drivers
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage driver accounts and delivery assignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {!showForm && (
                <GlassButton onClick={() => setShowForm(true)} className="whitespace-nowrap">
                  + Add Driver
                </GlassButton>
              )}
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <GlassCard className="p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {editId ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    label="Full Name *"
                    value={form.name}
                    onChange={set('name')}
                    required
                    placeholder="John Doe"
                  />
                  <GlassInput
                    label="Phone Number *"
                    value={form.phone}
                    onChange={set('phone')}
                    required
                    placeholder="0712345678"
                  />
                  <GlassInput
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="driver@example.com"
                  />
                  <GlassInput
                    label={editId ? 'Password (leave blank to keep current)' : 'Password *'}
                    type="password"
                    value={form.password}
                    onChange={set('password')}
                    required={!editId}
                    placeholder={editId ? 'Leave blank to keep current' : 'Enter password'}
                  />
                  <GlassInput
                    label="National ID"
                    value={form.national_id}
                    onChange={set('national_id')}
                    placeholder="12345678"
                  />
                  <GlassInput
                    label="License Number"
                    value={form.license_number}
                    onChange={set('license_number')}
                    placeholder="DL123456"
                  />
                  <GlassSelect
                    label="Vehicle Type *"
                    value={form.vehicle_type}
                    onChange={set('vehicle_type')}
                    required
                  >
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                  </GlassSelect>
                  <GlassInput
                    label="Vehicle Registration"
                    value={form.vehicle_registration}
                    onChange={set('vehicle_registration')}
                    placeholder="KAA 123A"
                  />
                  {editId && (
                    <GlassSelect
                      label="Status *"
                      value={form.status}
                      onChange={set('status')}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </GlassSelect>
                  )}
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3">
                  <GlassButton type="submit" loading={formLoading} disabled={formLoading}>
                    {editId ? 'Update Driver' : 'Add Driver'}
                  </GlassButton>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </GlassCard>
          )}

          {/* Search */}
          <div className="mb-4">
            <GlassInput
              placeholder="Search drivers by name, phone, email or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Drivers List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <GlassCard className="p-8 text-center text-gray-500 dark:text-gray-400">
              {search ? 'No drivers match your search.' : 'No drivers registered yet. Click "Add Driver" to get started.'}
            </GlassCard>
          ) : (
            <GlassCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/10 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300 text-left">
                      <th className="px-4 py-3 font-semibold">Driver</th>
                      <th className="px-4 py-3 font-semibold">Phone</th>
                      <th className="px-4 py-3 font-semibold">Vehicle</th>
                      <th className="px-4 py-3 font-semibold text-center">Deliveries</th>
                      <th className="px-4 py-3 font-semibold text-center">Active</th>
                      <th className="px-4 py-3 font-semibold text-center">Completed</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-gray-700/40">
                    {filtered.map((driver) => (
                      <tr key={driver.id} className="hover:bg-white/5 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{driver.name}</p>
                            {driver.email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{driver.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {driver.phone}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-gray-700 dark:text-gray-200 capitalize font-medium">
                              {driver.vehicle_type}
                            </p>
                            {driver.vehicle_registration && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{driver.vehicle_registration}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">
                          {driver.total_deliveries || 0}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                            {driver.active_deliveries || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            {driver.completed_deliveries || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            driver.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEdit(driver)}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-white/10 dark:border-gray-700/40 text-xs text-gray-500 dark:text-gray-400">
                {filtered.length} driver{filtered.length !== 1 ? 's' : ''}
                {search && ` matching "${search}"`}
              </div>
            </GlassCard>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageDrivers;
