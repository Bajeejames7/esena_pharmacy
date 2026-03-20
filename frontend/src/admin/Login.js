import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassButton from '../components/forms/GlassButton';

const API = process.env.REACT_APP_API_URL || 'https://esena.co.ke/api';

/**
 * Reset flow (4 steps):
 *  login  → normal sign-in
 *  2fa    → TOTP code
 *  forgot → enter email (validated server-side, must be registered)
 *  verify → enter 6-digit OTP (email is hidden, shown masked)
 *  reset  → enter new password (uses reset_token from verify step)
 */
const AdminLogin = () => {
  const [step, setStep] = useState('login');
  const [form, setForm] = useState({
    username: '', password: '', two_fa_code: '',
    email: '', otp_code: '', new_password: '', confirm_password: ''
  });
  const [resetToken, setResetToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);

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

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setError(''); };

  const goTo = (s) => { setStep(s); setError(''); setSuccess(''); };

  const maskEmail = (email) => {
    const [user, domain] = email.split('@');
    const visible = user.length <= 2 ? user[0] : user.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(user.length - 2, 3))}@${domain}`;
  };

  const storeSession = (data) => {
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify({
      id: data.user.id, username: data.user.username,
      email: data.user.email, role: data.user.role,
      full_name: data.user.full_name, loginTime: new Date().toISOString()
    }));
    navigate('/admin/dashboard');
  };

  // ── STEP 1: LOGIN ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (data.requires2FA) { setStep('2fa'); return; }
      storeSession(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── STEP 1b: 2FA ───────────────────────────────────────────────────────────
  const handle2FA = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password, two_fa_code: form.two_fa_code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid 2FA code');
      storeSession(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── STEP 2: FORGOT — validate email + send OTP ─────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      // Email is valid — move to OTP step, hide the actual email
      setMaskedEmail(maskEmail(form.email));
      setAttemptsLeft(5);
      setStep('verify');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── STEP 3: VERIFY OTP ─────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp_code: form.otp_code })
      });
      const data = await res.json();
      if (!res.ok) {
        // Parse remaining attempts from message
        const match = data.message && data.message.match(/(\d+) attempt/);
        if (match) setAttemptsLeft(parseInt(match[1]));
        else if (res.status === 429) setAttemptsLeft(0);
        throw new Error(data.message || 'Invalid code');
      }
      // OTP verified — store reset token and move to password step
      setResetToken(data.reset_token);
      setStep('reset');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── STEP 4: SET NEW PASSWORD ───────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) return setError('Passwords do not match');
    if (form.new_password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: resetToken, new_password: form.new_password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setSuccess('Password set successfully. You can now log in.');
      setStep('login');
      setForm(f => ({ ...f, otp_code: '', new_password: '', confirm_password: '' }));
      setResetToken('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  const titles = {
    login: 'Admin Login', '2fa': 'Two-Factor Auth',
    forgot: 'Forgot Password', verify: 'Enter Reset Code', reset: 'Set New Password'
  };
  const subs = {
    login: 'Sign in with username or email',
    '2fa': 'Enter the code from your authenticator app',
    forgot: 'Enter your account email address',
    verify: `Code sent to ${maskedEmail}`,
    reset: 'Choose a new password for your account'
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-md w-full">
        <GlassCard className="p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-gray-800 dark:text-white mb-1">{titles[step]}</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{subs[step]}</p>
          </div>

          {/* Banners */}
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
          {attemptsLeft !== null && step === 'verify' && attemptsLeft > 0 && (
            <div className="mb-4 p-3 bg-orange-100/50 dark:bg-orange-900/30 border border-orange-300 rounded-lg text-orange-800 dark:text-orange-200 text-sm">
              {attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} remaining.
            </div>
          )}

          {/* ── LOGIN ── */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <GlassInput label="Username or Email" name="username" value={form.username} onChange={set('username')} required autoComplete="username" placeholder="admin or email" />
              <GlassInput label="Password" name="password" type="password" value={form.password} onChange={set('password')} required autoComplete="current-password" placeholder="Enter your password" />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
                {loading ? 'Signing in...' : 'Sign In'}
              </GlassButton>
              <div className="text-center">
                <button type="button" onClick={() => goTo('forgot')} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {/* ── 2FA ── */}
          {step === '2fa' && (
            <form onSubmit={handle2FA} className="space-y-5">
              <GlassInput label="Authenticator Code" name="two_fa_code" value={form.two_fa_code} onChange={set('two_fa_code')} required placeholder="6-digit code" maxLength={6} autoComplete="one-time-code" />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
                {loading ? 'Verifying...' : 'Verify'}
              </GlassButton>
              <div className="text-center">
                <button type="button" onClick={() => goTo('login')} className="text-gray-500 text-sm hover:underline">← Back</button>
              </div>
            </form>
          )}

          {/* ── FORGOT: enter email ── */}
          {step === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-5">
              <GlassInput label="Email Address" name="email" type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" autoComplete="email" />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
                {loading ? 'Sending...' : 'Send Code'}
              </GlassButton>
              <div className="text-center">
                <button type="button" onClick={() => goTo('login')} className="text-gray-500 text-sm hover:underline">← Back to login</button>
              </div>
            </form>
          )}

          {/* ── VERIFY: enter OTP only ── */}
          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-5">
              <GlassInput
                label="6-Digit Code"
                name="otp_code"
                value={form.otp_code}
                onChange={set('otp_code')}
                required
                placeholder="Enter the code from your email"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              <GlassButton type="submit" loading={loading} disabled={loading || attemptsLeft === 0} className="w-full" size="lg">
                {loading ? 'Verifying...' : 'Verify Code'}
              </GlassButton>
              <div className="text-center">
                <button type="button" onClick={() => { setForm(f => ({ ...f, otp_code: '' })); goTo('forgot'); }} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* ── RESET: set new password ── */}
          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-5">
              <GlassInput label="New Password" name="new_password" type="password" value={form.new_password} onChange={set('new_password')} required placeholder="Min 8 characters" autoComplete="new-password" autoFocus />
              <GlassInput label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password} onChange={set('confirm_password')} required placeholder="Repeat password" autoComplete="new-password" />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
                {loading ? 'Setting password...' : 'Set Password'}
              </GlassButton>
            </form>
          )}

          {step !== 'login' && step !== 'forgot' && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setStep('login')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm transition-colors">
                ← Back to Login
              </button>
            </div>
          )}

        </GlassCard>
      </div>
    </div>
  );
};

export default AdminLogin;
