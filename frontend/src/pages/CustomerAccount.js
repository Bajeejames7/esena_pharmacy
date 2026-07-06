import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { KENYA_COUNTIES, getTownOptions } from '../utils/kenyaLocations';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const FILES_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

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

  const [tab, setTab] = useState('orders'); // 'orders' | 'appointments' | 'prescriptions' | 'profile'
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
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
    if (tab === 'appointments') fetchAppointments();
    if (tab === 'prescriptions') fetchPrescriptions();
  }, [tab, firebaseUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    setDataLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/customers/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (_) {} finally { setDataLoading(false); }
  };

  const fetchAppointments = async () => {
    setDataLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/customers/appointments`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAppointments(data.appointments);
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
            { id: 'appointments',  label: 'Appointments' },
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
          <div className="space-y-6">
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
            
            {!dataLoading && orders.length > 0 && (() => {
              // Separate active and completed orders, then sort by date (newest first)
              const activeOrders = orders
                .filter(o => !['completed', 'cancelled'].includes(o.status))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              
              const completedOrders = orders
                .filter(o => ['completed', 'cancelled'].includes(o.status))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              
              return (
                <>
                  {/* Active Orders */}
                  {activeOrders.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                        Active Orders ({activeOrders.length})
                      </h2>
                      <div className="space-y-4">
                        {activeOrders.map(order => (
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
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Completed Orders */}
                  {completedOrders.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                        Completed Orders ({completedOrders.length})
                      </h2>
                      <div className="space-y-4">
                        {completedOrders.map(order => (
                          <GlassCard key={order.id} className="p-5 opacity-80">
                            <div className="flex items-start justify-between flex-wrap gap-3">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-semibold text-gray-800 dark:text-white">Order #{order.id}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.completed}`}>
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
                                  <GlassButton variant="secondary" size="sm">View</GlassButton>
                                </Link>
                                <GlassButton size="sm" onClick={() => handleReorder(order.id)}>
                                  Reorder
                                </GlassButton>
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ── APPOINTMENTS TAB ── */}
        {tab === 'appointments' && (
          <div className="space-y-4">
            {dataLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
            {!dataLoading && appointments.length === 0 && (
              <GlassCard className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No appointments booked yet.</p>
                <Link to="/book-appointment">
                  <GlassButton>Book Appointment</GlassButton>
                </Link>
              </GlassCard>
            )}
            {appointments.map(appt => (
              <GlassCard key={appt.id} className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {appt.service}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        appt.status === 'pending'   ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                        appt.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        appt.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                        appt.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(() => {
                        const datePart = appt.date ? appt.date.split('T')[0] : null;
                        if (!datePart) return 'Date not specified';
                        const [year, month, day] = datePart.split('-').map(Number);
                        const dateObj = new Date(year, month - 1, day);
                        return dateObj.toLocaleDateString('en-KE', { dateStyle: 'medium' });
                      })()}
                      {appt.time && ` at ${appt.time}`}
                    </p>
                  </div>
                  <Link to={`/track-appointment/${appt.token}`}>
                    <GlassButton variant="secondary" size="sm">Track</GlassButton>
                  </Link>
                </div>

                {/* Doctor's Notes */}
                {appt.notes && appt.notes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Doctor's Notes
                    </h4>
                    <div className="space-y-3">
                      {appt.notes.map(note => (
                        <div key={note.id} className="bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                {(note.admin_name || 'Dr').charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                  {note.admin_name || 'Doctor'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(note.created_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {note.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reports / Lab Results */}
                {appt.reports && appt.reports.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Reports & Documents
                    </h4>
                    <div className="space-y-2">
                      {appt.reports.map(report => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-green-50/60 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">
                                {report.file_name}
                              </p>
                              {report.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {report.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Uploaded {new Date(report.created_at).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                              </p>
                            </div>
                          </div>
                          <a
                            href={`${FILES_BASE}/uploads/${report.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

// Inline profile editor with health information
const ProfileEditor = ({ customer, getToken, onSaved }) => {
  const { refreshProfile } = useCustomerAuth();
  
  // Calculate date limits for age validation (18+ required)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString().split('T')[0]; // 18 years ago
  const minDate = new Date(today.getFullYear() - 125, today.getMonth(), today.getDate())
    .toISOString().split('T')[0]; // 125 years ago
  
  const [form, setForm] = useState({
    name:                     customer.name || '',
    phone:                    customer.phone || '',
    delivery_address:         customer.delivery_address || '',
    landmark:                 customer.landmark || '',
    city:                     customer.city || '',
    county:                   customer.county || '',
    date_of_birth:            customer.date_of_birth || '',
    blood_type:               customer.blood_type || 'Unknown',
    chronic_conditions:       customer.chronic_conditions || '',
    allergies:                customer.allergies || '',
    emergency_contact_name:   customer.emergency_contact_name || '',
    emergency_contact_phone:  customer.emergency_contact_phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    // If county changes, reset city
    if (name === 'county') {
      setForm(p => ({ ...p, [name]: value, city: '' }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const handleSave = async () => {
    // Validate emergency contact phone is different from user's phone
    if (form.phone && form.emergency_contact_phone) {
      const normalizedUserPhone = form.phone.replace(/\s+/g, '').replace(/^(\+254|254)/, '0');
      const normalizedEmergencyPhone = form.emergency_contact_phone.replace(/\s+/g, '').replace(/^(\+254|254)/, '0');
      
      if (normalizedUserPhone === normalizedEmergencyPhone) {
        alert('Emergency contact phone must be different from your phone number. Please provide a different contact person.');
        return;
      }
    }
    
    // Validate age (must be 18+)
    if (form.date_of_birth) {
      const birthDate = new Date(form.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      // Adjust age if birthday hasn't occurred this year yet
      const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
      
      if (actualAge < 18) {
        alert('You must be at least 18 years old to purchase medicines. Please enter a valid date of birth.');
        return;
      }
    }
    
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

  const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

  return (
    <GlassCard className="p-6">
      <h2 className="font-semibold text-gray-800 dark:text-white mb-5">Your Profile</h2>
      <div className="space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={form.emergency_contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={form.emergency_contact_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Delivery Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Street Address</label>
              <input
                type="text"
                name="delivery_address"
                value={form.delivery_address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Closest Landmark</label>
              <input
                type="text"
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">County</label>
                <select
                  name="county"
                  value={form.county}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select County</option>
                  {KENYA_COUNTIES.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Town / City</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  disabled={!form.county}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{form.county ? 'Select Town / City' : 'Select a county first'}</option>
                  {getTownOptions(form.county).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Health Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Health Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date of Birth (Must be 18+)</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDate}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Blood Type</label>
                <select
                  name="blood_type"
                  value={form.blood_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BLOOD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Chronic Conditions</label>
              <input
                type="text"
                name="chronic_conditions"
                value={form.chronic_conditions}
                onChange={handleChange}
                placeholder="e.g., Diabetes, Hypertension"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Known Allergies</label>
              <input
                type="text"
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="e.g., Penicillin, Aspirin"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

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
