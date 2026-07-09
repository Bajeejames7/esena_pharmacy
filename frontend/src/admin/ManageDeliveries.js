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

const ManageDeliveries = () => {
  const { breakpoint } = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !isTablet);

  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [reassignDriverId, setReassignDriverId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassigning, setReassigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [deliveriesRes, driversRes] = await Promise.all([
        fetch(`${API}/drivers/admin/deliveries`, { headers: headers() }),
        fetch(`${API}/drivers/admin/list`, { headers: headers() })
      ]);
      
      const deliveriesData = await deliveriesRes.json();
      const driversData = await driversRes.json();
      
      setDeliveries(deliveriesData.deliveries || []);
      setDrivers((driversData.drivers || []).filter(d => d.status === 'active'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetails(true);
    setReassignDriverId('');
    setReassignReason('');
  };

  const handleReassign = async () => {
    if (!reassignDriverId) {
      alert('Please select a driver');
      return;
    }
    
    setReassigning(true);
    try {
      const res = await fetch(`${API}/drivers/admin/deliveries/${selectedDelivery.id}/reassign`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          new_driver_id: parseInt(reassignDriverId),
          reason: reassignReason || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reassign');

      alert('Delivery reassigned successfully!');
      setShowDetails(false);
      load();
    } catch (err) {
      alert('Failed to reassign: ' + err.message);
    } finally {
      setReassigning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'out_for_delivery': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'delivered': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'failed': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300';
    }
  };

  const filtered = deliveries.filter(d => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        String(d.order_id).includes(term) ||
        d.customer_name?.toLowerCase().includes(term) ||
        d.driver_name?.toLowerCase().includes(term) ||
        d.order_token?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Delivery Tracking"
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                Delivery Tracking
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor all deliveries and driver assignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <GlassButton onClick={load} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </GlassButton>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <GlassInput
                placeholder="Search by order ID, customer name, driver name, or token..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <GlassSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </GlassSelect>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <GlassCard className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {deliveries.length}
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Assigned</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {deliveries.filter(d => d.status === 'assigned').length}
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {deliveries.filter(d => d.status === 'delivered').length}
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {deliveries.filter(d => d.status === 'failed').length}
              </p>
            </GlassCard>
          </div>

          {/* Deliveries List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <GlassCard className="p-8 text-center text-gray-500 dark:text-gray-400">
              {search || statusFilter ? 'No deliveries match your filters.' : 'No deliveries yet. Assign drivers to paid orders to see them here.'}
            </GlassCard>
          ) : (
            <GlassCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/10 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300 text-left">
                      <th className="px-4 py-3 font-semibold">Order</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Driver</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Assigned</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-gray-700/40">
                    {filtered.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-white/5 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 dark:text-white">#{delivery.order_id}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{delivery.order_token?.substring(0, 8)}...</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 dark:text-white">{delivery.customer_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{delivery.delivery_address?.substring(0, 30)}...</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 dark:text-white">{delivery.driver_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{delivery.vehicle_type} - {delivery.driver_phone}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">
                          KSh {parseFloat(delivery.order_total || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                            {delivery.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(delivery.assigned_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewDetails(delivery)}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-white/10 dark:border-gray-700/40 text-xs text-gray-500 dark:text-gray-400">
                {filtered.length} deliver{filtered.length !== 1 ? 'ies' : 'y'}
                {(search || statusFilter) && ` matching filters`}
              </div>
            </GlassCard>
          )}
        </main>
      </div>

      {/* Delivery Details Modal */}
      {showDetails && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetails(false)}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Delivery Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <div className="p-4 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                        <span className="font-medium text-gray-800 dark:text-white">#{selectedDelivery.order_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Token:</span>
                        <span className="font-mono text-xs text-gray-800 dark:text-white">{selectedDelivery.order_token}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                        <span className="font-medium text-gray-800 dark:text-white">KSh {parseFloat(selectedDelivery.order_total || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDelivery.status)}`}>
                          {selectedDelivery.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Customer</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600 dark:text-gray-400">Name:</span> <span className="font-medium text-gray-800 dark:text-white">{selectedDelivery.customer_name}</span></p>
                      <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> <span className="text-gray-800 dark:text-white">{selectedDelivery.customer_phone}</span></p>
                      <p><span className="text-gray-600 dark:text-gray-400">Email:</span> <span className="text-gray-800 dark:text-white">{selectedDelivery.customer_email}</span></p>
                      <p><span className="text-gray-600 dark:text-gray-400">Address:</span> <span className="text-gray-800 dark:text-white">{selectedDelivery.delivery_address}</span></p>
                      {selectedDelivery.delivery_zone && (
                        <p><span className="text-gray-600 dark:text-gray-400">Zone:</span> <span className="text-gray-800 dark:text-white capitalize">{selectedDelivery.delivery_zone.replace(/_/g, ' ')}</span></p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="space-y-4">
                  <div className="p-4 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Driver</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600 dark:text-gray-400">Name:</span> <span className="font-medium text-gray-800 dark:text-white">{selectedDelivery.driver_name}</span></p>
                      <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> <span className="text-gray-800 dark:text-white">{selectedDelivery.driver_phone}</span></p>
                      <p><span className="text-gray-600 dark:text-gray-400">Vehicle:</span> <span className="text-gray-800 dark:text-white capitalize">{selectedDelivery.vehicle_type}</span></p>
                      <p><span className="text-gray-600 dark:text-gray-400">Assigned by:</span> <span className="text-gray-800 dark:text-white">{selectedDelivery.assigned_by_name}</span></p>
                      <p><span className="text-gray-600 dark:text-gray-400">Assigned at:</span> <span className="text-gray-800 dark:text-white">{new Date(selectedDelivery.assigned_at).toLocaleString()}</span></p>
                      {selectedDelivery.started_at && (
                        <p><span className="text-gray-600 dark:text-gray-400">Started:</span> <span className="text-gray-800 dark:text-white">{new Date(selectedDelivery.started_at).toLocaleString()}</span></p>
                      )}
                      {selectedDelivery.completed_at && (
                        <p><span className="text-gray-600 dark:text-gray-400">Completed:</span> <span className="text-gray-800 dark:text-white">{new Date(selectedDelivery.completed_at).toLocaleString()}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Proof of Delivery */}
                  {selectedDelivery.proof_of_delivery && (
                    <div className="p-4 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Proof of Delivery</h3>
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'https://esena.co.ke/api'}${selectedDelivery.proof_of_delivery}`}
                        alt="Proof of delivery"
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}

                  {/* Delivery Notes */}
                  {selectedDelivery.delivery_notes && (
                    <div className="p-4 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Delivery Notes</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDelivery.delivery_notes}</p>
                    </div>
                  )}

                  {/* Failed Reason */}
                  {selectedDelivery.status === 'failed' && selectedDelivery.failed_reason && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Failed Reason</h3>
                      <p className="text-sm text-red-700 dark:text-red-400">{selectedDelivery.failed_reason}</p>
                    </div>
                  )}

                  {/* Reassign Section */}
                  {selectedDelivery.status !== 'delivered' && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Reassign Delivery</h3>
                      <div className="space-y-3">
                        <GlassSelect
                          label="New Driver"
                          value={reassignDriverId}
                          onChange={(e) => setReassignDriverId(e.target.value)}
                          disabled={reassigning}
                        >
                          <option value="">Select driver...</option>
                          {drivers.filter(d => d.id !== selectedDelivery.driver_id).map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} ({driver.vehicle_type}) - {driver.active_deliveries || 0} active
                            </option>
                          ))}
                        </GlassSelect>
                        <GlassInput
                          label="Reason (optional)"
                          value={reassignReason}
                          onChange={(e) => setReassignReason(e.target.value)}
                          placeholder="e.g., Driver unavailable, vehicle breakdown..."
                        />
                        <GlassButton
                          size="sm"
                          className="w-full"
                          onClick={handleReassign}
                          disabled={!reassignDriverId || reassigning}
                        >
                          {reassigning ? 'Reassigning...' : 'Reassign to New Driver'}
                        </GlassButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDeliveries;
