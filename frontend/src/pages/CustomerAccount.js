import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STATUS_COLORS = {
  pending:           'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  payment_requested: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  paid:              'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',
  dispatched:        'bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300',
  ready_for_pickup:  'bg-teal-100   text-teal-800   dark:bg-teal-900/40   dark:text-teal-300',
  completed:         'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-300',
  cancelled:         'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300',
};

const CustomerAccount = () => {
  const { customer, firebaseUser, getToken, logout, loading } = useCustomerAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('orders'); // 'orders' | 'prescriptions' | 'profile'
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      navigate('/login', { state: { from: '/account' }, replace: true });
    }
  }, [loading, firebaseUser, navigate]);

  useEffect(() => {
    if (!firebaseUser) return;
    if (tab === 'orders') fetchOrders();
    if (tab === 'prescriptions') fetchPrescriptions();
  }, [tab, firebaseUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    setDataLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/customers/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (_) {} finally { setDataLoading(false); }
  };

  const fetchPrescriptions = async () => {
    setDataLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/customers/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPrescriptions(data.prescriptions);
    } catch (_) {} finally { setDataLoading(false); }
  };

  const handleReorder = async (orderId) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/customers/reorder/${orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        // Navigate to checkout with the draft pre-filled
        navigate('/checkout', { state: { prefill: data.draft } });
      }
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {firebaseUser?.photoURL ? (
              <img src={firebaseUser.photoURL} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {customer.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-gray-800 dark:text-white font-bold text-xl">{customer.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{customer.email}</p>
            </div>
          </div>
          <button
            onClick={async () => { await logout(); navigate('/'); }}
            className="text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-white/10 dark:bg-gray-800/40 rounded-xl p-1 w-fit">
          {[
            { id: 'orders',        label: 'My Orders' },
            { id: 'prescriptions', label: 'Prescriptions' },
            { id: 'profile',       label: 'Profile' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {dataLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
            {!dataLoading && orders.length === 0 && (
              <GlassCard className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't placed any orders yet.</p>
                <Link to="/products">
                  <GlassButton>Browse Products</GlassButton>
                </Link>
              </GlassCard>
            )}
            {orders.map(order => (
              <GlassCard key={order.id} className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-800 dark:text-white">Order #{order.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                      {' · '}KSh {parseFloat(order.total).toFixed(2)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(order.items || []).slice(0, 3).map((item, i) => (
                        <span key={i} className="text-xs bg-white/20 dark:bg-gray-700 rounded px-2 py-0.5 text-gray-600 dark:text-gray-300">
                          {item.name} ×{item.quantity}
                        </span>
                      ))}
                      {(order.items || []).length > 3 && (
                        <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/track/${order.token}`}>
                      <GlassButton variant="secondary" size="sm">Track</GlassButton>
                    </Link>
                    {['completed', 'cancelled'].includes(order.status) && (
                      <GlassButton size="sm" onClick={() => handleReorder(order.id)}>
                        Reorder
                      </GlassButton>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* ── PRESCRIPTIONS TAB ── */}
        {tab === 'prescriptions' && (
          <div className="space-y-4">
            {dataLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
            {!dataLoading && prescriptions.length === 0 && (
              <GlassCard className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No prescriptions uploaded yet.</p>
                <Link to="/upload-prescription">
                  <GlassButton>Upload Prescription</GlassButton>
                </Link>
              </GlassCard>
            )}
            {prescriptions.map(rx => (
              <GlassCard key={rx.id} className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      Prescription #{rx.id}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(rx.created_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                      {rx.notes && ` · ${rx.notes}`}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                      rx.status === 'pending'   ? 'bg-yellow-100 text-yellow-800' :
                      rx.status === 'processed' ? 'bg-green-100 text-green-800'  :
                      'bg-gray-100 text-gray-700'
                    }`}>{rx.status}</span>
                  </div>
                  {rx.file_path && (
                    <a
                      href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${rx.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <GlassButton variant="secondary" size="sm">View File</GlassButton>
                    </a>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <ProfileEditor customer={customer} getToken={getToken} onSaved={() => {}} />
        )}
      </div>
    </div>
  );
};

// Inline profile editor
const ProfileEditor = ({ customer, getToken, onSaved }) => {
  const { refreshProfile } = useCustomerAuth();
  const [form, setForm] = useState({
    name:             customer.name || '',
    phone:            customer.phone || '',
    delivery_address: customer.delivery_address || '',
    city:             customer.city || '',
    county:           customer.county || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/customers/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await refreshProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        onSaved();
      }
    } finally { setSaving(false); }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="font-semibold text-gray-800 dark:text-white mb-5">Your Details</h2>
      <div className="space-y-4">
        {[
          { label: 'Full Name',       name: 'name',             type: 'text' },
          { label: 'Phone Number',    name: 'phone',            type: 'tel' },
          { label: 'Street Address',  name: 'delivery_address', type: 'text' },
          { label: 'County',          name: 'county',           type: 'text' },
          { label: 'Town / City',     name: 'city',             type: 'text' },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{f.label}</label>
            <input
              type={f.type}
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div className="pt-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
          <p className="text-sm text-gray-500 dark:text-gray-400 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl">
            {customer.email}
          </p>
        </div>
        <GlassButton onClick={handleSave} loading={saving} disabled={saving} className="w-full mt-2">
          {saved ? 'Saved!' : 'Save Changes'}
        </GlassButton>
      </div>
    </GlassCard>
  );
};

export default CustomerAccount;
