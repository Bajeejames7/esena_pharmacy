import React, { useState, useEffect } from 'react';
import { useBreakpoint } from '../utils/responsive';
import AdminSidebar from '../components/AdminSidebar';
import DataTable from '../components/DataTable';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';

/**
 * Admin orders management page
 * Implements Requirements 17.8, 25.8, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 */
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

  const isMobile = breakpoint === 'mobile';
  const itemsPerPage = 20;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'payment_requested', label: 'Payment Requested' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const statusTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['payment_requested', 'dispatched', 'cancelled'],
    payment_requested: ['processing', 'dispatched', 'cancelled'],
    dispatched: ['delivered'],
    delivered: [],
    cancelled: []
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    loadOrders();
  }, [currentPage, searchTerm, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await ordersAPI.getAll({ page: currentPage, search: searchTerm, status: statusFilter });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate demo data
      const allOrders = generateDemoOrders();
      let filteredOrders = allOrders;
      
      // Apply filters
      if (searchTerm) {
        filteredOrders = filteredOrders.filter(order =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }
      
      // Pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      setOrders(paginatedOrders);
      setTotalItems(filteredOrders.length);
      setTotalPages(Math.ceil(filteredOrders.length / itemsPerPage));
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error('Load orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoOrders = () => {
    const demoOrders = [];
    const customers = [
      { name: 'John Doe', email: 'john.doe@example.com', phone: '(555) 123-4567' },
      { name: 'Jane Smith', email: 'jane.smith@example.com', phone: '(555) 234-5678' },
      { name: 'Bob Johnson', email: 'bob.johnson@example.com', phone: '(555) 345-6789' },
      { name: 'Alice Brown', email: 'alice.brown@example.com', phone: '(555) 456-7890' },
      { name: 'Charlie Wilson', email: 'charlie.wilson@example.com', phone: '(555) 567-8901' }
    ];
    
    const statuses = ['pending', 'processing', 'payment_requested', 'dispatched', 'delivered', 'cancelled'];
    const items = [
      { name: 'Vitamin D3 Supplement', price: 15.99, quantity: 2 },
      { name: 'Pain Relief Tablets', price: 8.50, quantity: 1 },
      { name: 'Hand Sanitizer', price: 4.99, quantity: 3 },
      { name: 'Omega-3 Fish Oil', price: 22.75, quantity: 1 },
      { name: 'First Aid Kit', price: 35.00, quantity: 1 }
    ];
    
    for (let i = 0; i < 100; i++) {
      const customer = customers[i % customers.length];
      const orderItems = items.slice(0, Math.floor(Math.random() * 3) + 1);
      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 50 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
      
      demoOrders.push({
        id: `ORD-${(i + 1).toString().padStart(5, '0')}`,
        token: `TOKEN-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: `${Math.floor(Math.random() * 9999) + 1} Main St, City, State ${Math.floor(Math.random() * 90000) + 10000}`,
        items: orderItems,
        subtotal,
        shipping,
        tax,
        total,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return demoOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'payment_requested': return 'bg-purple-100 text-purple-800';
      case 'dispatched': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-200 text-green-900';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm font-medium text-gray-800">{value}</span>
      )
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-800">{value}</p>
          <p className="text-sm text-gray-600">{row.customerEmail}</p>
        </div>
      )
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value) => `$${parseFloat(value).toFixed(2)}`
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
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = [
    {
      label: 'View Details',
      variant: 'secondary',
      onClick: (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
      }
    }
  ];

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    
    try {
      // TODO: Replace with actual API call
      // await ordersAPI.updateStatus(orderId, newStatus);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ 
          ...prev, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        }));
      }
      
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Update status error:', error);
      setError('Failed to update order status. Please try again.');
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

  const isValidStatusTransition = (currentStatus, newStatus) => {
    return statusTransitions[currentStatus]?.includes(newStatus) || false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white flex">
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
                <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
                <p className="text-gray-600">View and update customer orders</p>
              </div>
            </div>
            
            <GlassButton
              variant="secondary"
              onClick={loadOrders}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </GlassButton>
          </div>

          {/* Search and Filters */}
          <GlassCard className="p-6 mb-6">
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
              <div className="md:col-span-2">
                <GlassInput
                  placeholder="Search orders by ID, customer name, or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <GlassSelect
                options={statusOptions}
                value={statusFilter}
                onChange={handleStatusFilter}
              />
            </div>
          </GlassCard>

          {/* Orders Table */}
          <DataTable
            data={orders}
            columns={columns}
            loading={loading}
            error={error}
            actions={actions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            emptyMessage="No orders found."
          />
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Order Details - {selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Order Status */}
                  <div className="p-6 bg-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Order Status</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Order Date</p>
                        <p className="font-medium text-gray-800">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Updated</p>
                        <p className="font-medium text-gray-800">{new Date(selectedOrder.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tracking Token</p>
                        <p className="font-mono text-sm text-gray-800">{selectedOrder.token}</p>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <h4 className="font-medium text-gray-800 mb-3">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {statusTransitions[selectedOrder.status]?.map(status => (
                          <GlassButton
                            key={status}
                            size="sm"
                            variant={status === 'cancelled' ? 'danger' : 'secondary'}
                            onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                            disabled={updatingStatus}
                          >
                            {updatingStatus ? 'Updating...' : status.replace('_', ' ')}
                          </GlassButton>
                        ))}
                        {statusTransitions[selectedOrder.status]?.length === 0 && (
                          <p className="text-gray-600 text-sm">No status updates available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">IMG</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{item.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Customer & Summary */}
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="p-6 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Customer Information</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium text-gray-800">{selectedOrder.customerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="text-gray-800">{selectedOrder.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="text-gray-800">{selectedOrder.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Address</p>
                        <p className="text-gray-800">{selectedOrder.customerAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-6 bg-white/10 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-800">${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-800">
                          {selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-800">${selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-white/20 pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">Total</span>
                          <span className="font-semibold text-gray-800">${selectedOrder.total.toFixed(2)}</span>
                        </div>
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
                        onClick={() => window.open(`mailto:${selectedOrder.customerEmail}?subject=Order ${selectedOrder.id}`)}
                      >
                        Email Customer
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(`/track/${selectedOrder.token}`, '_blank')}
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
  );
};

export default ManageOrders;