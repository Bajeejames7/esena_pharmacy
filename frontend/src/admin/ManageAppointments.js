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

  const isMobile = breakpoint === 'mobile';
  const itemsPerPage = 20;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' }
  ];

  const serviceOptions = [
    { value: '', label: 'All Services' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'labtest', label: 'Lab Test' },
    { value: 'pharmacist', label: 'Pharmacist Consultation' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'health-screening', label: 'Health Screening' }
  ];

  const statusTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'no_show', 'cancelled'],
    completed: [],
    cancelled: [],
    no_show: []
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
      // TODO: Replace with actual API call
      // const response = await appointmentsAPI.getAll({ page: currentPage, search: searchTerm, status: statusFilter, service: serviceFilter });
      
      setAppointments([]);
      setTotalItems(0);
      setTotalPages(1);
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
      case 'no_show': return 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case 'dermatology':
        return '👩‍⚕️';
      case 'labtest':
        return '🔬';
      case 'pharmacist':
        return '💊';
      case 'vaccination':
        return '💉';
      case 'health-screening':
        return '🩺';
      default:
        return '📋';
    }
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
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-100">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{row.customerEmail}</p>
        </div>
      )
    },
    {
      key: 'service',
      label: 'Service',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getServiceIcon(value)}</span>
          <span className="text-gray-800 dark:text-gray-100">{row.serviceLabel}</span>
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
          {value.replace('_', ' ')}
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
      // TODO: Replace with actual API call
      // await appointmentsAPI.updateStatus(appointmentId, newStatus);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setAppointments(prev => prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus, updatedAt: new Date().toISOString() }
          : appointment
      ));
      
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => ({ 
          ...prev, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        }));
      }
      
      console.log(`Appointment ${appointmentId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Update status error:', error);
      setError('Failed to update appointment status. Please try again.');
    } finally {
      setUpdatingStatus(false);
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
        showMenuButton={isMobile}
      />
      
      <div className="flex flex-1">
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
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Appointments</h1>
                <p className="text-gray-600 dark:text-gray-300">View and manage customer appointments</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
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
          <GlassCard className="p-6 mb-6">
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'}`}>
              <div className="md:col-span-2">
                <GlassInput
                  placeholder="Search appointments by ID, customer name, or email..."
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
                        {selectedAppointment.status.replace('_', ' ')}
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
                          <span className="font-medium text-gray-800">{selectedAppointment.serviceLabel}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Tracking Token</p>
                        <p className="font-mono text-sm text-gray-800">{selectedAppointment.token}</p>
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
                        <p className="font-medium text-gray-800">{selectedAppointment.customerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="text-gray-800">{selectedAppointment.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="text-gray-800">{selectedAppointment.customerPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Timeline */}
                  <div className="p-6 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Timeline</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="text-gray-800">{new Date(selectedAppointment.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Updated</p>
                        <p className="text-gray-800">{new Date(selectedAppointment.updatedAt).toLocaleString()}</p>
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
                        onClick={() => window.open(`mailto:${selectedAppointment.customerEmail}?subject=Appointment ${selectedAppointment.id}`)}
                      >
                        Email Customer
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(`tel:${selectedAppointment.customerPhone}`)}
                      >
                        Call Customer
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(`/track/${selectedAppointment.token}`, '_blank')}
                      >
                        View Tracking Page
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