import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import GlassButton from '../components/forms/GlassButton';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { countyOptions, getTownOptions } from '../utils/kenyaLocations';

/**
 * Shown after Google sign-in or email sign-up to collect
 * phone, address and other details not available from Firebase.
 */
const CompleteProfile = () => {
  const { customer, firebaseUser, completeProfile } = useCustomerAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: customer?.name || firebaseUser?.displayName || '',
    phone: customer?.phone || '',
    delivery_address: customer?.delivery_address || '',
    county: customer?.county || '',
    city: customer?.city || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone.trim()) return setError('Phone number is required.');
    setError(''); setLoading(true);
    try {
      await completeProfile(form);
      navigate('/account', { replace: true });
    } catch (err) {
      setError('Failed to save your details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-lg mx-auto px-4">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            {firebaseUser?.photoURL && (
              <img
                src={firebaseUser.photoURL}
                alt="profile"
                className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
              />
            )}
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Almost there, {form.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Complete your profile to enable auto-fill on orders and appointments.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <GlassInput
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <GlassInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="07XX XXX XXX"
              required
            />
            <GlassInput
              label="Street Address"
              name="delivery_address"
              value={form.delivery_address}
              onChange={handleChange}
              placeholder="e.g. 14 Moi Avenue"
            />
            <div className="grid grid-cols-2 gap-4">
              <GlassSelect
                label="County"
                name="county"
                value={form.county}
                onChange={(e) => {
                  handleChange(e);
                  setForm(p => ({ ...p, city: '' }));
                }}
                options={countyOptions}
                placeholder="Select County"
              />
              <GlassSelect
                label="Town / City"
                name="city"
                value={form.city}
                onChange={handleChange}
                options={getTownOptions(form.county)}
                placeholder={form.county ? 'Select Town' : 'Select county first'}
                disabled={!form.county}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <GlassButton type="submit" loading={loading} disabled={loading} className="w-full">
              Save & Continue
            </GlassButton>
          </form>

          <button
            onClick={() => navigate('/account', { replace: true })}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-4"
          >
            Skip for now
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

export default CompleteProfile;
