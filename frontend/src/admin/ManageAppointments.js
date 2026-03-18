import React, { useState, useEffect } from 'react';
import { useBreakpoint } from '../utils/responsive';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import ThemeToggle from '../components/ThemeToggle';
import { appointmentsAPI } from '../services/api';
import api from '../services/api';
import { APPOINTMENT_SERVICE_FILTER_OPTIONS } from '../utils/appointmentServices';

/**
 * Admin appointments management page
 * Implements Requirements 17.9, 25.8, 9.5, 9.6, 9.7
 */
const ManageAppointments = () => {
  const { breakpoint } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(breakpoint !== 'mobile');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [rescheduling, setRescheduling] = useState(false);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const shouldShowMenuButton = isMobile || isTablet;
  const itemsPerPage = 20;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const serviceOptions = APPOINTMENT_SERVICE_FILTER_OPTIONS;

  const statusTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    loadAppointments();
  }, [currentPage, searchTerm, statusFilter, serviceFilter]);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await appointmentsAPI.getAll();
      let all = response.data?.appointments || [];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        all = all.filter(a =>
          String(a.id).includes(term) ||
          (a.name || '').toLowerCase().includes(term) ||
          (a.email || '').toLowerCase().includes(term)
        );
      }
      if (statusFilter) all = all.filter(a => a.status === statusFilter);
      if (serviceFilter) all = all.filter(a => a.service === serviceFilter);

      setTotalItems(all.length);
      setTotalPages(Math.max(1, Math.ceil(all.length / itemsPerPage)));
      const start = (currentPage - 1) * itemsPerPage;
      setAppointments(all.slice(start, start + itemsPerPage));
    } catch (err) {
      setError('Failed to load appointments. Please try again.');
      console.error('Load appointments error:', err);
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'confirmed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'completed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getServiceIcon = (service) => {
    const s = (service || '').toLowerCase();
    if (s.includes('doctor')) return '👨‍⚕️';
    if (s.includes('pharmacist')) return '💊';
    if (s.includes('online') || s.includes('telemedicine')) return '💻';
    if (s.includes('dermatology') || s.includes('skin')) return '👩🏾‍⚕️';
    if (s.includes('nutrition') || s.includes('wellness')) return '🥗';
    if (s.includes('eye')) return '👁️';
    if (s.includes('heart')) return '❤️';
    if (s.includes('diabetes')) return '🩸';
    if (s.includes('weight')) return '⚖️';
    if (s.includes('lab') || s.includes('blood test')) return '🔬';
    if (s.includes('malaria')) return '🦟';
    if (s.includes('hiv')) return '🎗️';
    if (s.includes('cholesterol')) return '🫀';
    if (s.includes('screening')) return '🩺';
    if (s.includes('blood pressure')) return '💓';
    if (s.includes('glucose')) return '🩸';
    if (s.includes('bmi')) return '📏';
    if (s.includes('vaccination') || s.includes('immunization')) return '💉';
    if (s.includes('family planning') || s.includes('contraception')) return '🌸';
    if (s.includes('ear')) return '👂';
    return '📋';
  };

  const columns = [
    {
      key: 'id',
      label: 'Appointment ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-100">{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-100">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{row.email}</p>
        </div>
      )
    },
    {
      key: 'service',
      label: 'Service',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getServiceIcon(value)}</span>
          <span className="text-gray-800 dark:text-gray-100">{value}</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-100">{new Date(value).toLocaleDateString()}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{row.time}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(value)}`}>
          {(value || 'pending').replace('_', ' ')}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      variant: 'secondary',
      onClick: (appointment) => {
        setSelectedAppointment(appointment);
        setShowAppointmentDetails(true);
      }
    }
  ];

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await appointmentsAPI.updateStatus(appointmentId, newStatus);
      // Update both the table and the open modal
      setAppointments(prev => prev.map(a =>
        a.id === appointmentId ? { ...a, status: newStatus } : a
      ));
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Update status error:', error);
      // Reload from DB so optimistic update doesn't stick on failure
      await loadAppointments();
      alert(`Failed to update status: ${error.response?.data?.message || error.message || 'Please try again.'}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date) return;
    setRescheduling(true);
    try {
      await api.put(`/appointments/${selectedAppointment.id}/reschedule`, rescheduleData);
      const newDate = rescheduleData.time ? `${rescheduleData.date}T${rescheduleData.time}:00` : rescheduleData.date;
      setAppointments(prev => prev.map(a =>
        a.id === selectedAppointment.id ? { ...a, date: newDate, time: rescheduleData.time, status: 'confirmed' } : a
      ));
      setSelectedAppointment(prev => ({ ...prev, date: newDate, time: rescheduleData.time, status: 'confirmed' }));
      setShowReschedule(false);
      setRescheduleData({ date: '', time: '' });
    } catch (err) {
      setError('Failed to reschedule appointment.');
    } finally {
      setRescheduling(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleServiceFilter = (e) => {
    setServiceFilter(e.target.value);
    setCurrentPage(1);
  };

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
      
      <div className={`flex-1 transition-all duration-300 ${
        !shouldShowMenuButton && sidebarOpen ? 'ml-64' : !shouldShowMenuButton ? 'ml-16' : ''
      }`}>
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Appointments</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">View and manage customer appointments</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <ThemeToggle showLabel={true} />
              </div>
              <GlassButton
                variant="secondary"
                onClick={loadAppointments}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </GlassButton>
            </div>
          </div>

          {/* Search and Filters */}
          <GlassCard className="p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <GlassInput
                  placeholder="Search by ID, name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <GlassSelect
                options={statusOptions}
                value={statusFilter}
                onChange={handleStatusFilter}
              />
              <GlassSelect
                options={serviceOptions}
                value={serviceFilter}
                onChange={handleServiceFilter}
              />
            </div>
          </GlassCard>

          {/* Appointments Table */}
          <DataTable
            data={appointments}
            columns={columns}
            loading={loading}
            error={error}
            actions={actions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            emptyMessage="No appointments found."
          />
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Appointment Details - {selectedAppointment.id}
                </h2>
                <button
                  onClick={() => setShowAppointmentDetails(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appointment Information */}
                <div className="space-y-6">
                  {/* Appointment Status */}
                  <div className="p-6 bg-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Appointment Status</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedAppointment.status)}`}>
                        {(selectedAppointment.status || 'pending').replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-medium text-gray-800">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Time</p>
                        <p className="font-medium text-gray-800">{selectedAppointment.time}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Service</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getServiceIcon(selectedAppointment.service)}</span>
                          <span className="font-medium text-gray-800">{selectedAppointment.service}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Tracking Token</p>
                        <p className="font-mono text-xs text-gray-800 break-all">{selectedAppointment.token}</p>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <h4 className="font-medium text-gray-800 mb-3">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {statusTransitions[selectedAppointment.status]?.map(status => (
                          <GlassButton
                            key={status}
                            size="sm"
                            variant={status === 'cancelled' || status === 'no_show' ? 'danger' : 'secondary'}
                            onClick={() => handleStatusUpdate(selectedAppointment.id, status)}
                            disabled={updatingStatus}
                          >
                            {updatingStatus ? 'Updating...' : status.replace('_', ' ')}
                          </GlassButton>
                        ))}
                        {statusTransitions[selectedAppointment.status]?.length === 0 && (
                          <p className="text-gray-600 text-sm">No status updates available</p>
                        )}
                      </div>
                    </div>

                    {/* Reschedule */}
                    {['pending', 'confirmed'].includes(selectedAppointment.status) && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <h4 className="font-medium text-gray-800 mb-3">Reschedule Appointment</h4>
                        {!showReschedule ? (
                          <GlassButton size="sm" variant="secondary" onClick={() => setShowReschedule(true)}>
                            Change Date / Time
                          </GlassButton>
                        ) : (
                          <div className="space-y-3">
                            <GlassInput
                              label="New Date"
                              name="reschedule-date"
                              type="date"
                              value={rescheduleData.date}
                              onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <GlassSelect
                              label="New Time"
                              name="reschedule-time"
                              value={rescheduleData.time}
                              onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                              options={[
                                { value: '', label: 'Select time' },
                                { value: '09:00', label: '9:00 AM' },
                                { value: '09:30', label: '9:30 AM' },
                                { value: '10:00', label: '10:00 AM' },
                                { value: '10:30', label: '10:30 AM' },
                                { value: '11:00', label: '11:00 AM' },
                                { value: '11:30', label: '11:30 AM' },
                                { value: '14:00', label: '2:00 PM' },
                                { value: '14:30', label: '2:30 PM' },
                                { value: '15:00', label: '3:00 PM' },
                                { value: '15:30', label: '3:30 PM' },
                                { value: '16:00', label: '4:00 PM' },
                                { value: '16:30', label: '4:30 PM' },
                              ]}
                            />
                            <div className="flex gap-2">
                              <GlassButton size="sm" onClick={handleReschedule} disabled={rescheduling || !rescheduleData.date}>
                                {rescheduling ? 'Saving...' : 'Confirm & Notify Customer'}
                              </GlassButton>
                              <GlassButton size="sm" variant="secondary" onClick={() => { setShowReschedule(false); setRescheduleData({ date: '', time: '' }); }}>
                                Cancel
                              </GlassButton>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Customer Message */}
                  {selectedAppointment.message && (
                    <div className="p-6 bg-white/10 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">Customer Message</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedAppointment.message}</p>
                    </div>
                  )}
                </div>

                {/* Customer Information & Actions */}
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="p-6 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Customer Information</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium text-gray-800">{selectedAppointment.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="text-gray-800">{selectedAppointment.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="text-gray-800">{selectedAppointment.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Timeline */}
                  <div className="p-6 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Timeline</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="text-gray-800">{new Date(selectedAppointment.created_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Updated</p>
                        <p className="text-gray-800">{new Date(selectedAppointment.updated_at || selectedAppointment.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-6 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(`mailto:${selectedAppointment.email}?subject=Appointment ${selectedAppointment.id}`)}
                      >
                        Email Customer
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(`tel:${selectedAppointment.phone}`)}
                      >
                        Call Customer
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ManageAppointments;