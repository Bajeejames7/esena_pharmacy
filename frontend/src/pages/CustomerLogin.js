import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassButton from '../components/forms/GlassButton';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

const CustomerLogin = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, needsProfile } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try {
      const result = await signInWithGoogle();
      // Check if profile needs completion from the sign-in result
      navigate(result.needsProfile ? '/complete-profile' : from, { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        if (form.password !== form.confirm) throw { code: 'passwords-mismatch' };
        if (!form.name.trim()) throw { code: 'name-required' };
        await signUpWithEmail(form.email, form.password, form.name);
        navigate('/complete-profile', { replace: true });
      } else {
        const result = await signInWithEmail(form.email, form.password);
        navigate(result.needsProfile ? '/complete-profile' : from, { replace: true });
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-md mx-auto px-4">

        {/* Benefits banner */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/40 dark:border-blue-700/30">
          <h2 className="font-semibold text-gray-800 dark:text-white text-lg mb-3">
            Your personal pharmacy, simplified
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {[
              'Auto-fill checkout with your saved details',
              'View and reorder your previous medicines',
              'Track all appointments and orders in one place',
              'Manage your prescriptions securely',
            ].map(b => (
              <li key={b} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <GlassCard className="p-8">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-white/10 dark:bg-gray-800/40 p-1 mb-6">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-gray-900 text-xs text-gray-500">or</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <GlassInput
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            )}
            <GlassInput
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <GlassInput
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {mode === 'signup' && (
              <GlassInput
                label="Confirm Password"
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <GlassButton type="submit" loading={loading} disabled={loading} className="w-full">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </GlassButton>
          </form>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-5">
            By continuing you agree to our{' '}
            <Link to="/terms" className="underline">Terms</Link> and{' '}
            <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
          </p>
        </GlassCard>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Just browsing?{' '}
          <Link to="/products" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Continue without an account
          </Link>
        </p>
      </div>
    </div>
  );
};

const friendlyError = (code) => {
  const map = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'passwords-mismatch':        'Passwords do not match.',
    'name-required':             'Please enter your name.',
  };
  return map[code] || 'Something went wrong. Please try again.';
};

export default CustomerLogin;
