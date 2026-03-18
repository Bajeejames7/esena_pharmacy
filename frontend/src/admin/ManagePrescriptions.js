import React, { useState, useEffect } from 'react';
import { useBreakpoint } from '../utils/responsive';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import GlassTextarea from '../components/forms/GlassTextarea';
import ThemeToggle from '../components/ThemeToggle';
import { prescriptionsAPI } from '../services/api';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DELIVERY_TYPE_OPTIONS = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup from Shop (Free)' },
];

const DELIVERY_ZONE_OPTIONS = [
  { value: 'nairobi', label: 'Within Nairobi (KSH 150)' },
  { value: 'outside_nairobi', label: 'Outside Nairobi (KSH 350)' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':   return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    case 'reviewed':  return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    default:          return 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300';
  }
};

const emptyItem = () => ({ name: '', quantity: '1', price: '' });

const ManagePrescriptions = () => {
  const { breakpoint } = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const shouldShowMenuButton = isMobile || isTablet;

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Create-order form state
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    delivery_address: '',
    delivery_type: 'delivery',
    delivery_zone: 'nairobi',
    notes: '',
    items: [emptyItem()],
  });
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // { orderId, token }
  const [orderError, setOrderError] = useState(null);

  useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);
  useEffect(() => { loadPrescriptions(); }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await prescriptionsAPI.getAll();
      setPrescriptions(res.data?.data || []);
    } catch {
      setError('Failed to load prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingStatus(true);
    try {
      await prescriptionsAPI.updateStatus(id, newStatus);
      setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
    } catch {
      setError('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openOrderForm = () => {
    setOrderForm({
      delivery_address: '',
      delivery_type: 'delivery',
      delivery_zone: 'nairobi',
      notes: '',
      items: [emptyItem()],
    });
    setOrderSuccess(null);
    setOrderError(null);
    setShowOrderForm(true);
  };

  const addItem = () => setOrderForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (i) => setOrderForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, value) => setOrderForm(f => {
    const items = [...f.items];
    items[i] = { ...items[i], [field]: value };
    return { ...f, items };
  });

  // Delivery fee is auto-calculated from type/zone — admin adjusts it later in Orders if needed
  const getShippingCost = (type, zone) => {
    if (type === 'pickup') return 0;
    if (zone === 'outside_nairobi') return 350;
    return 150; // nairobi default
  };

  const itemsTotal = orderForm.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);
  const shippingCost = getShippingCost(orderForm.delivery_type, orderForm.delivery_zone);
  const grandTotal = itemsTotal + shippingCost;

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setOrderError(null);

    const validItems = orderForm.items.filter(i => i.name.trim() && parseFloat(i.price) > 0);
    if (validItems.length === 0) {
      setOrderError('Add at least one medicine with a name and price.');
      return;
    }

    setCreatingOrder(true);
    try {
      const res = await prescriptionsAPI.createOrder(selected.id, {
        delivery_address: orderForm.delivery_address,
        delivery_type: orderForm.delivery_type,
        delivery_zone: orderForm.delivery_zone,
        shipping_cost: shippingCost,
        notes: orderForm.notes,
        items: validItems.map(i => ({
          name: i.name.trim(),
          quantity: parseInt(i.quantity) || 1,
          price: parseFloat(i.price),
        })),
      });
      setOrderSuccess({ orderId: res.data.orderId, token: res.data.token });
      // Update local prescription status to completed
      setPrescriptions(prev => prev.map(p => p.id === selected.id ? { ...p, status: 'completed' } : p));
      setSelected(prev => ({ ...prev, status: 'completed' }));
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const filtered = prescriptions.filter(p => {
    const matchesStatus = !statusFilter || p.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      (p.name || '').toLowerCase().includes(term) ||
      (p.phone || '').includes(term) ||
      (p.email || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      key: 'id', label: 'ID', sortable: true,
      render: (v) => <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-100">#{v}</span>
    },
    {
      key: 'name', label: 'Patient', sortable: true,
      render: (v, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-100">{v}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{row.phone}</p>
        </div>
      )
    },
    { key: 'email', label: 'Email', render: (v) => <span className="text-sm text-gray-700 dark:text-gray-300">{v}</span> },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (v) => <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(v)}`}>{v}</span>
    },
    { key: 'created_at', label: 'Submitted', sortable: true, render: (v) => new Date(v).toLocaleDateString() },
  ];

  const actions = [{ label: 'View', variant: 'secondary', onClick: (row) => { setSelected(row); setShowOrderForm(false); setOrderSuccess(null); } }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader onMenuToggle={() => setSidebarOpen(true)} showMenuButton={shouldShowMenuButton} />
      <div className="flex flex-1">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className={`flex-1 transition-all duration-300 ${!shouldShowMenuButton && sidebarOpen ? 'ml-64' : !shouldShowMenuButton ? 'ml-16' : ''}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 lg:block hidden">Prescriptions</h1>
                <p className="text-gray-600 dark:text-gray-300">Review patient prescriptions and create orders</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden lg:block"><ThemeToggle showLabel={true} /></div>
                <GlassButton variant="secondary" onClick={loadPrescriptions} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </GlassButton>
              </div>
            </div>

            <GlassCard className="p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <GlassInput
                    placeholder="Search by name, phone or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="sm:w-48">
                  <GlassSelect options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
                </div>
              </div>
            </GlassCard>

            <DataTable data={filtered} columns={columns} loading={loading} error={error} actions={actions} emptyMessage="No prescriptions found." />
          </div>
        </div>

        {/* Detail + Order modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-3xl my-8">
              <GlassCard className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Prescription #{selected.id}
                  </h2>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label="Close">
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Patient info */}
                  <div className="p-5 bg-white/10 dark:bg-slate-700/30 rounded-lg">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Patient Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-500 dark:text-gray-400">Name</p><p className="font-medium text-gray-800 dark:text-gray-100">{selected.name}</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400">Phone</p><p className="font-medium text-gray-800 dark:text-gray-100">{selected.phone}</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400">Email</p><p className="font-medium text-gray-800 dark:text-gray-100">{selected.email}</p></div>
                      <div><p className="text-gray-500 dark:text-gray-400">Submitted</p><p className="font-medium text-gray-800 dark:text-gray-100">{new Date(selected.created_at).toLocaleString()}</p></div>
                    </div>
                    {selected.message && (
                      <div className="mt-3">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Patient Note</p>
                        <p className="text-gray-800 dark:text-gray-100 text-sm mt-1 bg-white/10 p-3 rounded">{selected.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Prescription file */}
                  <div className="p-5 bg-white/10 dark:bg-slate-700/30 rounded-lg">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Prescription File</h3>
                    {selected.file_path ? (
                      <div className="space-y-3">
                        {/\.(jpg|jpeg|png)$/i.test(selected.file_path) && (
                          <img src={`${API_BASE}/uploads/prescriptions/${selected.file_path}`} alt="Prescription" className="max-w-full rounded-lg border border-white/20 max-h-64 object-contain" />
                        )}
                        <a href={`${API_BASE}/uploads/prescriptions/${selected.file_path}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-glass-blue/20 hover:bg-glass-blue/30 text-blue-700 dark:text-blue-300 rounded-lg transition-colors text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{/\.pdf$/i.test(selected.file_path) ? 'Open PDF' : 'View Full Image'}</span>
                        </a>
                      </div>
                    ) : <p className="text-gray-500 text-sm">No file attached.</p>}
                  </div>

                  {/* Status + quick actions */}
                  <div className="p-5 bg-white/10 dark:bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">Status</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selected.status)}`}>{selected.status}</span>
                    </div>

                    {/* Workflow instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-3 mb-4 text-sm text-blue-800 dark:text-blue-300">
                      {selected.status === 'pending' && (
                        <p>📋 <strong>Step 1:</strong> Review the prescription file above, then mark as <strong>Reviewed</strong> to proceed to creating an order.</p>
                      )}
                      {selected.status === 'reviewed' && (
                        <p>📞 <strong>Step 2:</strong> Call or WhatsApp the patient to confirm medicines and delivery details, then use <strong>Create Order</strong> below to place the order. This will mark the prescription as completed.</p>
                      )}
                      {selected.status === 'completed' && (
                        <p>✅ <strong>Done.</strong> An order has been created for this prescription. Find it in the <strong>Orders</strong> section to manage payment and delivery.</p>
                      )}
                      {selected.status === 'cancelled' && (
                        <p>❌ This prescription was cancelled. No order can be created.</p>
                      )}
                    </div>

                    {/* Status action buttons — only show relevant transitions */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selected.status === 'pending' && (
                        <GlassButton size="sm" variant="secondary"
                          onClick={() => handleStatusUpdate(selected.id, 'reviewed')} disabled={updatingStatus}>
                          {updatingStatus ? 'Updating...' : '🔍 Mark as Reviewed'}
                        </GlassButton>
                      )}
                      {selected.status === 'reviewed' && (
                        <GlassButton size="sm" variant="secondary"
                          onClick={() => handleStatusUpdate(selected.id, 'pending')} disabled={updatingStatus}>
                          {updatingStatus ? 'Updating...' : '↩ Back to Pending'}
                        </GlassButton>
                      )}
                      {['pending', 'reviewed'].includes(selected.status) && (
                        <GlassButton size="sm" variant="danger"
                          onClick={() => handleStatusUpdate(selected.id, 'cancelled')} disabled={updatingStatus}>
                          {updatingStatus ? 'Updating...' : '✕ Cancel Prescription'}
                        </GlassButton>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <GlassButton variant="secondary" size="sm" onClick={() => window.open(`mailto:${selected.email}?subject=Your Prescription #${selected.id}`)}>
                        Email Patient
                      </GlassButton>
                      <GlassButton variant="secondary" size="sm" onClick={() => window.open(`https://wa.me/${selected.phone.replace(/\D/g, '')}`, '_blank')}>
                        WhatsApp
                      </GlassButton>
                    </div>
                  </div>

                  {/* Create Order section — only for reviewed or completed */}
                  {['reviewed', 'completed'].includes(selected.status) && (
                    <div className="p-5 bg-white/10 dark:bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                          📦 Create Order
                        </h3>
                        {selected.status === 'reviewed' && !showOrderForm && !orderSuccess && (
                          <GlassButton size="sm" onClick={openOrderForm}>
                            Create Order
                          </GlassButton>
                        )}
                      </div>

                      {selected.status === 'completed' && !orderSuccess && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          An order was created from this prescription. Go to <strong>Orders</strong> in the sidebar to manage payment and delivery status.
                        </p>
                      )}

                      {/* Order success banner */}
                      {orderSuccess && (
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                          <p className="text-green-800 dark:text-green-300 font-medium">✅ Order created successfully!</p>
                          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                            Order ID: <strong>#{orderSuccess.orderId}</strong> &nbsp;|&nbsp; Tracking: <code className="font-mono">{orderSuccess.token}</code>
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-500 mt-1">Confirmation emails sent to patient and pharmacy.</p>
                        </div>
                      )}

                      {/* Order form */}
                      {showOrderForm && !orderSuccess && (
                        <form onSubmit={handleCreateOrder} className="space-y-5 mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Call or WhatsApp the patient to confirm medicines and delivery details, then fill in the form below.
                          </p>

                          {/* Medicine items */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Medicines</p>
                              <button type="button" onClick={addItem}
                                className="text-xs px-3 py-1 bg-glass-blue/20 hover:bg-glass-blue/30 text-blue-700 dark:text-blue-300 rounded-lg transition-colors">
                                + Add Item
                              </button>
                            </div>
                            <div className="space-y-2">
                              {orderForm.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                                  <div className="col-span-5">
                                    <GlassInput label={i === 0 ? 'Medicine Name' : ''} placeholder="e.g. Amoxicillin 500mg"
                                      value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} required />
                                  </div>
                                  <div className="col-span-2">
                                    <GlassInput label={i === 0 ? 'Qty' : ''} type="number" min="1" placeholder="1"
                                      value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} required />
                                  </div>
                                  <div className="col-span-3">
                                    <GlassInput label={i === 0 ? 'Price (KSH)' : ''} type="number" min="0" step="0.01" placeholder="0.00"
                                      value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} required />
                                  </div>
                                  <div className="col-span-2 pb-1">
                                    {orderForm.items.length > 1 && (
                                      <button type="button" onClick={() => removeItem(i)}
                                        className="w-full py-2 text-red-500 hover:text-red-700 text-sm transition-colors">
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery details */}
                          <div className="grid grid-cols-2 gap-4">
                            <GlassSelect
                              label="Delivery Type"
                              placeholder={null}
                              options={DELIVERY_TYPE_OPTIONS}
                              value={orderForm.delivery_type}
                              onChange={e => setOrderForm(f => ({
                                ...f,
                                delivery_type: e.target.value,
                                delivery_zone: e.target.value === 'pickup' ? 'nairobi' : f.delivery_zone,
                              }))} />
                            {orderForm.delivery_type === 'delivery' && (
                              <GlassSelect
                                label="Zone"
                                placeholder={null}
                                options={DELIVERY_ZONE_OPTIONS}
                                value={orderForm.delivery_zone}
                                onChange={e => setOrderForm(f => ({ ...f, delivery_zone: e.target.value }))} />
                            )}
                          </div>

                          <GlassInput label="Delivery Address" placeholder="Full delivery address"
                            value={orderForm.delivery_address}
                            onChange={e => setOrderForm(f => ({ ...f, delivery_address: e.target.value }))}
                            required={orderForm.delivery_type === 'delivery'} />

                          <GlassTextarea label="Notes (optional)" placeholder="Any additional notes..."
                            value={orderForm.notes} rows={2}
                            onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))} />

                          {/* Order total preview */}
                          <div className="bg-white/10 dark:bg-slate-600/30 rounded-lg p-4 text-sm">
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                              <span>Medicines subtotal</span><span>KSH {itemsTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700 dark:text-gray-300 mt-1">
                              <span>Delivery fee</span>
                              <span>{shippingCost === 0 ? 'FREE (Pickup)' : `KSH ${shippingCost.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-100 mt-2 pt-2 border-t border-white/20">
                              <span>Total</span><span>KSH {grandTotal.toFixed(2)}</span>
                            </div>
                            {orderForm.delivery_type === 'delivery' && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                * Delivery fee can be adjusted later in the Orders section if needed.
                              </p>
                            )}
                          </div>

                          {orderError && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                              <p className="text-red-600 dark:text-red-400 text-sm">{orderError}</p>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <GlassButton type="submit" disabled={creatingOrder} className="flex-1 bg-glass-blue text-white">
                              {creatingOrder ? 'Creating Order...' : '📦 Create Order & Send Confirmation'}
                            </GlassButton>
                            <GlassButton type="button" variant="secondary" onClick={() => setShowOrderForm(false)}>
                              Cancel
                            </GlassButton>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePrescriptions;
