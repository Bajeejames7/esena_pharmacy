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
import { ordersAPI } from '../services/api';

const ManageOrders = () => {
  const { breakpoint } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(breakpoint !== 'mobile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editShipping, setEditShipping] = useState('');
  const [savingShipping, setSavingShipping] = useState(false);
  const [shippingSaved, setShippingSaved] = useState(false);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const shouldShowMenuButton = isMobile || isTablet;
  const itemsPerPage = 20;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'payment_requested', label: 'Payment Requested' },
    { value: 'paid', label: 'Paid' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const statusTransitions = {
    pending: ['payment_requested', 'completed'],
    payment_requested: ['paid', 'completed'],
    paid: ['dispatched', 'completed'],
    dispatched: ['completed'],
    completed: [],
    cancelled: []
  };

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    loadOrders();
  }, [currentPage, searchTerm, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersAPI.getAll();
      let allOrders = response.data?.orders || [];
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        allOrders = allOrders.filter(o =>
          String(o.id).includes(term) ||
          (o.customer_name || '').toLowerCase().includes(term) ||
          (o.email || '').toLowerCase().includes(term)
        );
      }
      if (statusFilter) allOrders = allOrders.filter(o => o.status === statusFilter);
      setTotalItems(allOrders.length);
      setTotalPages(Math.max(1, Math.ceil(allOrders.length / itemsPerPage)));
      const start = (currentPage - 1) * itemsPerPage;
      setOrders(allOrders.slice(start, start + itemsPerPage));
    } catch (err) {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    setLoadingDetails(true);
    setShippingSaved(false);
    try {
      const response = await ordersAPI.getById(order.id);
      setSelectedOrder(response.data);
      setEditShipping(String(parseFloat(response.data.shipping_cost || 0)));
    } catch (err) {
      setError('Failed to load order details: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveShipping = async () => {
    if (!selectedOrder) return;
    setSavingShipping(true);
    setShippingSaved(false);
    try {
      const res = await ordersAPI.updateShipping(selectedOrder.id, parseFloat(editShipping) || 0);
      const newShipping = res.data.shipping_cost;
      const newTotal = res.data.total;
      setSelectedOrder(prev => ({ ...prev, shipping_cost: newShipping, total: newTotal }));
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, total: newTotal } : o));
      setShippingSaved(true);
    } catch (err) {
      setError('Failed to update delivery fee: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingShipping(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'payment_requested': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'paid': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'dispatched': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'completed': return 'bg-green-200 dark:bg-green-800/30 text-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300';
    }
  };

  const columns = [
    { key: 'id', label: 'Order ID', sortable: true, render: (v) => <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-100">{v}</span> },
    { key: 'customer_name', label: 'Customer', sortable: true, render: (v, row) => <div><p className="font-medium text-gray-800 dark:text-gray-100">{v}</p><p className="text-sm text-gray-600 dark:text-gray-300">{row.email}</p></div> },
    { key: 'total', label: 'Total', sortable: true, render: (v) => `KSH ${parseFloat(v).toFixed(2)}` },
    { key: 'delivery_type', label: 'Delivery', render: (v, row) => { const label = v === 'pickup' ? '🏪 Pickup' : row.delivery_zone === 'outside_nairobi' ? '🚚 Outside Nbi' : '🚚 Nairobi'; return <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>; } },
    { key: 'status', label: 'Status', sortable: true, render: (v) => <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(v)}`}>{(v || 'unknown').replace(/_/g, ' ')}</span> },
    { key: 'created_at', label: 'Date', sortable: true, render: (v) => new Date(v).toLocaleDateString() }
  ];

  const actions = [{ label: 'View Details', variant: 'secondary', onClick: (order) => handleViewDetails(order) }];

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    const reason = window.prompt('Reason for cancellation (optional):') || '';
    setUpdatingStatus(true);
    try {
      await ordersAPI.cancel(orderId, reason);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      setError('Failed to cancel order: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const subtotal = selectedOrder?.items
    ? selectedOrder.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
    : (parseFloat(selectedOrder?.total || 0) - parseFloat(selectedOrder?.shipping_cost || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader onMenuToggle={() => setSidebarOpen(true)} showMenuButton={shouldShowMenuButton} />
      <div className="flex flex-1">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 transition-all duration-300 ${!shouldShowMenuButton && sidebarOpen ? 'ml-64' : !shouldShowMenuButton ? 'ml-16' : ''}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 lg:block hidden">Manage Orders</h1>
                <p className="text-gray-600 dark:text-gray-300">View and update customer orders</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden lg:block"><ThemeToggle showLabel={true} /></div>
                <GlassButton variant="secondary" onClick={loadOrders} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </GlassButton>
              </div>
            </div>

            <GlassCard className="p-6 mb-6">
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                <div className="md:col-span-2">
                  <GlassInput placeholder="Search orders by ID, customer name, or email..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>
                <GlassSelect options={statusOptions} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} />
              </div>
            </GlassCard>

            <DataTable data={orders} columns={columns} loading={loading} error={error} actions={actions} currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} emptyMessage="No orders found." />
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Order Details - #{selectedOrder.id} {loadingDetails && <span className="text-sm font-normal text-gray-500">(loading...)</span>}
                  </h2>
                  <button onClick={() => setShowOrderDetails(false)} className="p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label="Close">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Status */}
                    <div className="p-6 bg-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Order Status</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                          {(selectedOrder.status || 'unknown').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-gray-600">Order Date</p><p className="font-medium text-gray-800">{new Date(selectedOrder.created_at).toLocaleDateString()}</p></div>
                        <div><p className="text-gray-600">Tracking Token</p><p className="font-mono text-xs text-gray-800 break-all">{selectedOrder.token}</p></div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/20">
                        <h4 className="font-medium text-gray-800 mb-3">Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {statusTransitions[selectedOrder.status]?.map(status => (
                            <GlassButton key={status} size="sm" variant="secondary" onClick={() => handleStatusUpdate(selectedOrder.id, status)} disabled={updatingStatus}>
                              {updatingStatus ? 'Updating...' : status.replace(/_/g, ' ')}
                            </GlassButton>
                          ))}
                          {statusTransitions[selectedOrder.status]?.length === 0 && (
                            <p className="text-gray-600 text-sm">{selectedOrder.status === 'cancelled' ? 'This order has been cancelled.' : 'No status updates available'}</p>
                          )}
                          {['pending', 'payment_requested'].includes(selectedOrder.status) && (
                            <GlassButton size="sm" variant="danger" onClick={() => handleCancelOrder(selectedOrder.id)} disabled={updatingStatus} className="mt-2">Cancel Order</GlassButton>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 bg-white/10 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
                      <div className="space-y-3">
                        {loadingDetails ? <p className="text-gray-500 text-sm">Loading items...</p>
                          : (selectedOrder.items || []).length === 0 ? <p className="text-gray-500 text-sm italic">No items found.</p>
                          : (selectedOrder.items || []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                              <div><p className="font-medium text-gray-800">{item.name}</p><p className="text-sm text-gray-600">Qty: {item.quantity}</p></div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">KSH {(item.price * item.quantity).toFixed(2)}</p>
                                <p className="text-sm text-gray-600">KSH {parseFloat(item.price).toFixed(2)} each</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="p-6 bg-white/10 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">Customer Information</h3>
                      <div className="space-y-3 text-sm">
                        <div><p className="text-gray-600">Name</p><p className="font-medium text-gray-800">{selectedOrder.customer_name}</p></div>
                        <div><p className="text-gray-600">Email</p><p className="text-gray-800">{selectedOrder.email}</p></div>
                        <div><p className="text-gray-600">Phone</p><p className="text-gray-800">{selectedOrder.phone}</p></div>
                        <div><p className="text-gray-600">Address</p><p className="text-gray-800">{selectedOrder.delivery_address}</p></div>
                        <div>
                          <p className="text-gray-600">Delivery Type</p>
                          <p className="text-gray-800 font-medium capitalize">
                            {selectedOrder.delivery_type === 'pickup' ? '🏪 In-store Pickup' : selectedOrder.delivery_zone === 'outside_nairobi' ? '🚚 Delivery – Outside Nairobi' : '🚚 Delivery – Within Nairobi'}
                          </p>
                        </div>
                        {selectedOrder.notes && <div><p className="text-gray-600">Payment / Notes</p><p className="text-gray-800 font-medium">{selectedOrder.notes}</p></div>}
                      </div>
                    </div>

                    {/* Order Summary with editable delivery fee */}
                    <div className="p-6 bg-white/10 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Products Subtotal</span>
                          <span className="text-gray-800">KSH {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/20 pt-2 font-semibold">
                          <span className="text-gray-800">Total</span>
                          <span className="text-gray-800">KSH {parseFloat(selectedOrder.total).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Editable delivery fee */}
                      {selectedOrder.delivery_type !== 'pickup' && (
                        <div className="pt-4 border-t border-white/20">
                          <p className="text-sm font-medium text-gray-700 mb-2">Adjust Delivery Fee</p>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <GlassInput
                                label="Delivery Fee (KSH)"
                                type="number"
                                min="0"
                                value={editShipping}
                                onChange={(e) => { setEditShipping(e.target.value); setShippingSaved(false); }}
                              />
                            </div>
                            <GlassButton size="sm" onClick={handleSaveShipping} disabled={savingShipping} className="mb-1">
                              {savingShipping ? 'Saving...' : 'Save'}
                            </GlassButton>
                          </div>
                          {shippingSaved && <p className="text-xs text-green-600 mt-1">✓ Updated & customer notified by email</p>}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="p-6 bg-white/10 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <GlassButton variant="secondary" size="sm" className="w-full" onClick={() => window.open(`mailto:${selectedOrder.email}?subject=Order ${selectedOrder.id}`)}>Email Customer</GlassButton>
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

export default ManageOrders;