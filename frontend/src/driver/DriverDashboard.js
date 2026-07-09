import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import { useDriverAuth } from '../contexts/DriverAuthContext';

const API = process.env.REACT_APP_API_URL || 'https://esena.co.ke/api';

const DriverDashboard = () => {
  const { driver, isLoggedIn, logout, getToken } = useDriverAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [failedReason, setFailedReason] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/driver/login');
    }
  }, [isLoggedIn, navigate]);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/drivers/deliveries`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setDeliveries(data.deliveries || []);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoggedIn) {
      loadDeliveries();
    }
  }, [isLoggedIn, loadDeliveries]);

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetails(true);
    setNewStatus(delivery.status === 'assigned' ? 'out_for_delivery' : delivery.status === 'out_for_delivery' ? 'delivered' : '');
    setNotes(delivery.delivery_notes || '');
    setFailedReason(delivery.failed_reason || '');
    setProofFile(null);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;

    // Validate failed reason if marking as failed
    if (newStatus === 'failed' && (!failedReason || failedReason.trim() === '')) {
      alert('Please provide a reason for marking this delivery as failed');
      return;
    }

    // Require proof of delivery before marking as delivered
    if (newStatus === 'delivered' && !selectedDelivery.proof_of_delivery && !proofFile) {
      alert('Please upload proof of delivery photo before marking as delivered');
      return;
    }

    // If proof file is selected but not uploaded yet, upload it first
    if (newStatus === 'delivered' && proofFile && !selectedDelivery.proof_of_delivery) {
      alert('Please click "Upload Now" button to upload the proof photo first');
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API}/drivers/deliveries/${selectedDelivery.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes || null,
          failed_reason: newStatus === 'failed' ? failedReason : null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      alert(`Delivery status updated to ${newStatus.replace(/_/g, ' ')}!`);
      setShowDetails(false);
      loadDeliveries();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile) return;

    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('proof', proofFile);

      const res = await fetch(`${API}/drivers/deliveries/${selectedDelivery.id}/proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload proof');

      alert('Proof of delivery uploaded successfully! You can now mark as delivered.');
      setSelectedDelivery(prev => ({ ...prev, proof_of_delivery: data.proof_url }));
      setProofFile(null);
      // Reload deliveries to update the list
      loadDeliveries();
    } catch (err) {
      alert('Failed to upload proof: ' + err.message);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/driver/login');
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

  const activeDeliveries = deliveries.filter(d => d.status === 'assigned');
  const completedDeliveries = deliveries.filter(d => ['delivered', 'failed'].includes(d.status));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/full_logo.webp" alt="Esena Pharmacy" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">Driver Portal</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {driver?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton size="sm" variant="secondary" onClick={loadDeliveries} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </GlassButton>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{deliveries.length}</p>
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

        {/* Active Deliveries */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Active Deliveries</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeDeliveries.length === 0 ? (
            <GlassCard className="p-8 text-center text-gray-500 dark:text-gray-400">
              No active deliveries. Check back later!
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDeliveries.map(delivery => (
                <GlassCard key={delivery.id} className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">Order #{delivery.order_id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{delivery.order_token?.substring(0, 10)}...</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <p className="font-medium text-gray-800 dark:text-white">{delivery.customer_name}</p>
                    <p className="text-gray-600 dark:text-gray-400">{delivery.customer_phone}</p>
                    <p className="text-gray-600 dark:text-gray-400">{delivery.delivery_address}</p>
                    <p className="font-medium text-green-600 dark:text-green-400">KSh {parseFloat(delivery.order_total || 0).toLocaleString()}</p>
                  </div>
                  <GlassButton size="sm" className="w-full" onClick={() => handleViewDetails(delivery)}>
                    View Details
                  </GlassButton>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Completed Deliveries */}
        {completedDeliveries.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Completed Deliveries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedDeliveries.map(delivery => (
                <GlassCard key={delivery.id} className="p-5 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">Order #{delivery.order_id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(delivery.completed_at || delivery.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-3">
                    <p className="font-medium text-gray-800 dark:text-white">{delivery.customer_name}</p>
                    <p className="font-medium text-green-600 dark:text-green-400">KSh {parseFloat(delivery.order_total || 0).toLocaleString()}</p>
                    {delivery.proof_of_delivery && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">✓ Proof uploaded</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewDetails(delivery)}
                    className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Details
                  </button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delivery Details Modal */}
      {showDetails && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetails(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Delivery Details
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="p-4 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                      <span className="font-medium text-gray-800 dark:text-white">#{selectedDelivery.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        KSh {parseFloat(selectedDelivery.order_total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDelivery.status)}`}>
                        {selectedDelivery.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600 dark:text-gray-400">Name:</span> <span className="font-medium text-gray-800 dark:text-white">{selectedDelivery.customer_name}</span></p>
                    <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> <a href={`tel:${selectedDelivery.customer_phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">{selectedDelivery.customer_phone}</a></p>
                    <p><span className="text-gray-600 dark:text-gray-400">Address:</span> <span className="text-gray-800 dark:text-white">{selectedDelivery.delivery_address}</span></p>
                    {selectedDelivery.order_notes && (
                      <p><span className="text-gray-600 dark:text-gray-400">Notes:</span> <span className="text-gray-800 dark:text-white">{selectedDelivery.order_notes}</span></p>
                    )}
                  </div>
                </div>

                {/* Actions for Active Deliveries */}
                {['assigned'].includes(selectedDelivery.status) && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Update Delivery Status</h3>
                    <div className="space-y-3">
                      <GlassSelect
                        label="New Status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="">Select status...</option>
                        <option value="delivered">Mark as Delivered (with proof)</option>
                        <option value="failed">Mark as Failed</option>
                      </GlassSelect>

                      {newStatus === 'failed' && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                          <GlassInput
                            label="Failed Reason *"
                            value={failedReason}
                            onChange={(e) => setFailedReason(e.target.value)}
                            placeholder="e.g., Customer unavailable, wrong address..."
                            required
                          />
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            ⚠️ Please explain why the delivery could not be completed
                          </p>
                        </div>
                      )}

                      <GlassInput
                        label="Delivery Notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes..."
                      />

                      {/* Proof of Delivery Upload - Show when delivered is selected OR status is assigned */}
                      {(newStatus === 'delivered' || selectedDelivery.status === 'assigned') && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Proof of Delivery {newStatus === 'delivered' ? '(Required)' : '(Optional - can upload now or later)'}
                          </label>
                          {selectedDelivery.proof_of_delivery ? (
                            <div>
                              <p className="text-xs text-green-600 dark:text-green-400 mb-2">✓ Proof already uploaded</p>
                              <img
                                src={`${API}${selectedDelivery.proof_of_delivery}`}
                                alt="Proof"
                                className="w-full max-w-xs h-auto object-cover rounded-lg border-2 border-green-500"
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => setProofFile(e.target.files[0])}
                                className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {proofFile && (
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                                    Selected: {proofFile.name}
                                  </p>
                                  <GlassButton size="sm" onClick={handleUploadProof} disabled={uploadingProof}>
                                    {uploadingProof ? 'Uploading...' : 'Upload Now'}
                                  </GlassButton>
                                </div>
                              )}
                              {newStatus === 'delivered' && !selectedDelivery.proof_of_delivery && (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  ⚠️ Please upload proof before marking as delivered
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <GlassButton
                        className="w-full"
                        onClick={handleUpdateStatus}
                        disabled={
                          !newStatus || 
                          updatingStatus || 
                          (newStatus === 'failed' && !failedReason.trim())
                        }
                      >
                        {updatingStatus ? 'Updating...' : 'Update Status'}
                      </GlassButton>
                    </div>
                  </div>
                )}

                {/* Show Proof for Completed Deliveries */}
                {['delivered', 'failed'].includes(selectedDelivery.status) && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                      Delivery {selectedDelivery.status === 'delivered' ? 'Completed' : 'Failed'}
                    </h3>
                    {selectedDelivery.status === 'delivered' && selectedDelivery.proof_of_delivery && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Proof of Delivery:</p>
                        <img
                          src={`${API}${selectedDelivery.proof_of_delivery}`}
                          alt="Proof of Delivery"
                          className="w-full max-w-md h-auto object-cover rounded-lg border-2 border-green-500"
                        />
                      </div>
                    )}
                    {selectedDelivery.delivery_notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Notes:</p>
                        <p className="text-sm text-gray-800 dark:text-white">{selectedDelivery.delivery_notes}</p>
                      </div>
                    )}
                    {selectedDelivery.failed_reason && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Failed Reason:</p>
                        <p className="text-sm text-red-600 dark:text-red-400">{selectedDelivery.failed_reason}</p>
                      </div>
                    )}
                    {selectedDelivery.completed_at && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Completed: {new Date(selectedDelivery.completed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
