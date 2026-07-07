import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassButton from '../components/forms/GlassButton';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { KENYA_COUNTIES, getTownOptions } from '../utils/kenyaLocations';

const CHRONIC_CONDITIONS = [
  'Diabetes',
  'Hypertension (High Blood Pressure)',
  'Asthma',
  'Heart Disease',
  'Kidney Disease',
  'Arthritis',
  'Thyroid Disorder',
  'Cancer',
  'Epilepsy',
  'Other'
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const CompleteProfile = () => {
  const { customer, firebaseUser, completeProfile, refreshProfile, logout, loading: authLoading, isEmailVerified, resendVerificationEmail } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);

  // Calculate date limits for age validation (18+ required)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString().split('T')[0]; // 18 years ago
  const minDate = new Date(today.getFullYear() - 125, today.getMonth(), today.getDate())
    .toISOString().split('T')[0]; // 125 years ago (reasonable limit)

  const [form, setForm] = useState({
    phone: '',
    delivery_address: '',
    landmark: '',
    city: '',
    county: '',
    date_of_birth: '',
    blood_type: 'Unknown',
    chronic_conditions: [],
    other_condition: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Block browser back button
  useEffect(() => {
    // Push current state to prevent going back
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = (e) => {
      // Prevent going back
      window.history.pushState(null, '', window.location.href);
      // Show a message
      alert('Please complete your profile to continue. Click "Sign Out" if you want to exit.');
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Pre-fill if customer already has partial data
  useEffect(() => {
    if (customer) {
      setForm(prev => ({
        ...prev,
        phone: customer.phone || '',
        delivery_address: customer.delivery_address || '',
        landmark: customer.landmark || '',
        city: customer.city || '',
        county: customer.county || '',
        date_of_birth: customer.date_of_birth || '',
        blood_type: customer.blood_type || 'Unknown',
        chronic_conditions: customer.chronic_conditions ? customer.chronic_conditions.split(',').map(c => c.trim()) : [],
        allergies: customer.allergies || '',
        emergency_contact_name: customer.emergency_contact_name || '',
        emergency_contact_phone: customer.emergency_contact_phone || ''
      }));
    }
  }, [customer]);

  // Redirect if already completed or not logged in
  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      navigate('/login', { replace: true });
    }
    // Don't redirect away if profile is complete - ProfileGuard will handle it
  }, [authLoading, firebaseUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If county changes, reset city
    if (name === 'county') {
      setForm(prev => ({ ...prev, [name]: value, city: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleConditionToggle = (condition) => {
    setForm(prev => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions.includes(condition)
        ? prev.chronic_conditions.filter(c => c !== condition)
        : [...prev.chronic_conditions, condition]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!form.phone || !form.delivery_address || !form.landmark || !form.city || !form.county) {
      setError('Please fill in all required fields (Phone, Address, Landmark, City, County)');
      return;
    }

    // Validate Date of Birth is required
    if (!form.date_of_birth) {
      setError('Date of Birth is required. You must be at least 18 years old.');
      return;
    }

    // Validate Emergency Contact is required
    if (!form.emergency_contact_name || !form.emergency_contact_phone) {
      setError('Emergency contact details are required (Name and Phone)');
      return;
    }

    // Validate phone number
    if (form.phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    // Validate emergency contact phone
    if (form.emergency_contact_phone.length < 10) {
      setError('Please enter a valid emergency contact phone number');
      return;
    }

    // Validate emergency contact phone is different from user's phone
    const normalizedUserPhone = form.phone.replace(/\s+/g, '').replace(/^(\+254|254)/, '0');
    const normalizedEmergencyPhone = form.emergency_contact_phone.replace(/\s+/g, '').replace(/^(\+254|254)/, '0');
    
    if (normalizedUserPhone === normalizedEmergencyPhone) {
      setError('Emergency contact phone must be different from your phone number. Please provide a different contact person.');
      return;
    }

    // Validate age (must be 18+)
    const birthDate = new Date(form.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    // Adjust age if birthday hasn't occurred this year yet
    const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
    
    if (actualAge < 18) {
      setError('You must be at least 18 years old to purchase medicines. Please enter a valid date of birth.');
      return;
    }

    setLoading(true);
    try {
      // Include "Other" condition text if selected
      let conditions = [...form.chronic_conditions];
      if (conditions.includes('Other') && form.other_condition.trim()) {
        conditions = conditions.filter(c => c !== 'Other');
        conditions.push(`Other: ${form.other_condition.trim()}`);
      }

      const profileData = {
        phone: form.phone.trim(),
        delivery_address: form.delivery_address.trim(),
        landmark: form.landmark.trim() || null,
        city: form.city.trim(),
        county: form.county.trim(),
        date_of_birth: form.date_of_birth || null,
        blood_type: form.blood_type,
        chronic_conditions: conditions.length > 0 ? conditions.join(', ') : null,
        allergies: form.allergies.trim() || null,
        emergency_contact_name: form.emergency_contact_name.trim() || null,
        emergency_contact_phone: form.emergency_contact_phone.trim() || null,
        profile_completed: true
      };

      await completeProfile(profileData);
      // Force a full refresh of the profile to update needsProfile flag
      await refreshProfile();
      // Navigate to account after successful completion
      navigate('/account', { replace: true });
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Profile completion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out? You will need to complete your profile when you sign in again.')) {
      await logout();
      navigate('/', { replace: true });
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    try {
      await resendVerificationEmail();
      setEmailResent(true);
      setTimeout(() => setEmailResent(false), 5000);
    } catch (err) {
      console.error('Failed to resend verification:', err);
      alert('Failed to send verification email. Please try again later.');
    } finally {
      setResendingEmail(false);
    }
  };

  if (authLoading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-16 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-4 w-full">
        
        {/* Logo and Sign Out at top */}
        <div className="flex items-center justify-between mb-6">
          <img 
            src="/full_logo.webp" 
            alt="Esena Pharmacy" 
            className="h-16 w-auto"
          />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        {/* Email Verification Notice (for manual signups) */}
        {firebaseUser && !isEmailVerified && firebaseUser.providerData[0]?.providerId === 'password' && (
          <div className="mb-6 p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✉️</span>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-1">
                  Verify Your Email
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  We've sent a verification link to <strong>{firebaseUser.email}</strong>. 
                  Please check your inbox (and spam folder) to verify your email address.
                </p>
                {emailResent ? (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ Verification email sent! Check your inbox.
                  </p>
                ) : (
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50"
                  >
                    {resendingEmail ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Important Notice Banner */}
        <div className="mb-6 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                Profile Completion Required
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                To ensure we can serve you better and deliver your medications safely, please complete your profile. 
                You won't be able to place orders or book appointments until this is done.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            We need a few more details to provide you with the best service
          </p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500">📞</span> Contact Information
              </h2>
              <div className="space-y-4">
                <GlassInput
                  label="Phone Number *"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0712345678"
                  required
                />
                <GlassInput
                  label="Emergency Contact Name *"
                  name="emergency_contact_name"
                  value={form.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="Full name of a family member or friend"
                  required
                />
                <GlassInput
                  label="Emergency Contact Phone *"
                  name="emergency_contact_phone"
                  type="tel"
                  value={form.emergency_contact_phone}
                  onChange={handleChange}
                  placeholder="Different phone number (not your own)"
                  required
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500">📍</span> Delivery Address
              </h2>
              <div className="space-y-4">
                <GlassInput
                  label="Delivery Address *"
                  name="delivery_address"
                  value={form.delivery_address}
                  onChange={handleChange}
                  placeholder="Building name, street, estate"
                  required
                />
                <GlassInput
                  label="Closest Landmark *"
                  name="landmark"
                  value={form.landmark}
                  onChange={handleChange}
                  placeholder="e.g., Near Eastmart Supermarket, Opposite Equity Bank"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">County *</label>
                    <select
                      name="county"
                      value={form.county}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select County</option>
                      {KENYA_COUNTIES.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Town / City *</label>
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
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
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-blue-500">🏥</span> Health Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This helps doctors provide better care. All information is kept confidential.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    label="Date of Birth (Must be 18+) *"
                    name="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    min={minDate}
                    max={maxDate}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Blood Type
                    </label>
                    <select
                      name="blood_type"
                      value={form.blood_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {BLOOD_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                    Chronic Conditions (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CHRONIC_CONDITIONS.map(condition => (
                      <label
                        key={condition}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          form.chronic_conditions.includes(condition)
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                            : 'bg-white/30 dark:bg-gray-800/30 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.chronic_conditions.includes(condition)}
                          onChange={() => handleConditionToggle(condition)}
                          className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">{condition}</span>
                      </label>
                    ))}
                  </div>
                  {form.chronic_conditions.includes('Other') && (
                    <GlassInput
                      label="Please specify other condition"
                      name="other_condition"
                      value={form.other_condition}
                      onChange={handleChange}
                      placeholder="Specify your condition"
                      className="mt-3"
                    />
                  )}
                </div>

                <GlassInput
                  label="Known Allergies"
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="e.g., Penicillin, Aspirin, Peanuts (leave blank if none)"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <GlassButton
                type="submit"
                loading={loading}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </GlassButton>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              * Required fields. You can update this information later in your account settings.
            </p>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default CompleteProfile;
