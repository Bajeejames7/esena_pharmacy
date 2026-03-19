import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassButton from '../components/forms/GlassButton';

const API = process.env.REACT_APP_API_URL || 'https://esena.co.ke/api';

const AdminLogin = () => {
  const [step, setStep] = useState('login'); // login | setup | 2fa | forgot | reset
  const [form, setForm] = useState({ username: '', password: '', new_password: '', confirm_password: '', two_fa_code: '', otp_code: '', email: '' });
  const [setupToken, setSetupToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const sessionExpired = location.state?.sessionExpired;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp > Date.now() / 1000) navigate('/admin/dashboard');
      } catch {}
    }
  }, [navigate]);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  const storeSession = (data) => {
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role,
      full_name: data.user.full_name,
      loginTime: new Date().toISOString()
    }));
    navigate('/admin/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password, two_fa_code: form.two_fa_code || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.requiresPasswordSetup) {
        setSetupToken(data.setupToken);
        setStep('setup');
      } else if (data.requires2FA) {
        setStep('2fa');
      } else {
        storeSession(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password, two_fa_code: form.two_fa_code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid 2FA code');
      storeSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) return setError('Passwords do not match');
    if (form.new_password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/setup-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setup_token: setupToken, new_password: form.new_password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Setup failed');
      storeSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(data.message);
      setStep('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) return setError('Passwords do not match');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp_code: form.otp_code, new_password: form.new_password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Password reset! You can now log in.');
      setStep('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-md w-full">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-gray-800 dark:text-white mb-1">
              {step === 'login' && 'Admin Login'}
              {step === 'setup' && 'Set Your Password'}
              {step === '2fa' && 'Two-Factor Auth'}
              {step === 'forgot' && 'Forgot Password'}
              {step === 'reset' && 'Reset Password'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {step === 'login' && 'Sign in with username or email'}
              {step === 'setup' && 'Create a password for your account'}
              {step === '2fa' && 'Enter the code from your authenticator app'}
              {step === 'forgot' && 'Enter your email to receive a reset code'}
              {step === 'reset' && 'Enter the code sent to your email'}
            </p>
          </div>

          {sessionExpired && step === 'login' && (
            <div className="mb-4 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
              Your session expired. Please sign in again.
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100/50 dark:bg-green-900/30 border border-green-300 rounded-lg text-green-800 dark:text-green-200 text-sm">{success}</div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100/50 dark:bg-red-900/30 border border-red-200 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>
          )}

          {/* LOGIN */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <GlassInput label="Username or Email" name="username" value={form.username} onChange={set('username')} required autoComplete="username" placeholder="admin or email" />
              <GlassInput label="Password" name="password" type="password" value={form.password} onChange={set('password')} required autoComplete="current-password" placeholder="Enter your password" />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
                {loading ? 'Signing in...' : 'Sign In'}
              </GlassButton>
              <div className="text-center">
                <button type="button" onClick={() => { setStep('forgot'); setError(''); }} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {/* FIRST-TIME PASSWORD SETUP */}
          {step === 'setup' && (
            <form onSubmit={handleSetupPassword} className="space-y-5">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-900/30 border border-blue-200 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
                OTP verified. Create a secure password to activate your account.
              </div>
              <GlassInput label="New Password" name="new_password" type="password" value={form.new_password} onChange={set('new_password')} required placeholder="Min 8 characters" />
              <GlassInput label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password} onChange={set('confirm_password')} required placeholder="Repeat password" />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
                {loading ? 'Activating...' : 'Activate Account'}
              </GlassButton>
            </form>
          )}

          {/* 2FA */}
          {step === '2fa' && (
            <form onSubmit={handle2FA} className="space-y-5">
              <GlassInput label="Authenticator Code" name="two_fa_code" value={form.two_fa_code} onChange={set('two_fa_code')} required placeholder="6-digit code" maxLength={6} />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
                {loading ? 'Verifying...' : 'Verify'}
              </GlassButton>
              <div className="text-center">
                <button type="button" onClick={() => setStep('login')} className="text-gray-500 text-sm hover:underline">← Back</button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {step === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-5">
              <GlassInput label="Email Address" name="email" type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </GlassButton>
              <div className="text-center">
                <button type="button" onClick={() => setStep('login')} className="text-gray-500 text-sm hover:underline">← Back to login</button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD */}
          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-5">
              <GlassInput label="Email Address" name="email" type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" />
              <GlassInput label="Reset Code" name="otp_code" value={form.otp_code} onChange={set('otp_code')} required placeholder="6-digit code from email" maxLength={6} />
              <GlassInput label="New Password" name="new_password" type="password" value={form.new_password} onChange={set('new_password')} required placeholder="Min 8 characters" />
              <GlassInput label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password} onChange={set('confirm_password')} required placeholder="Repeat password" />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
                {loading ? 'Resetting...' : 'Reset Password'}
              </GlassButton>
              <div className="text-center">
                <button type="button" onClick={() => setStep('forgot')} className="text-gray-500 text-sm hover:underline">← Back</button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button type="button" onClick={() => navigate('/')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm transition-colors">
              ← Back to Main Site
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminLogin;
