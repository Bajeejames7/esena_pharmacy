import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassButton from '../components/forms/GlassButton';
import { useDriverAuth } from '../contexts/DriverAuthContext';

const DriverLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const { login, isLoggedIn } = useDriverAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/driver/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(phone, password);
      navigate('/driver/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://esena.co.ke/api'}/drivers/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: forgotPhone })
      });

      const data = await res.json();
      setForgotMessage(data.message || 'Request submitted. Contact your admin.');
      
      setTimeout(() => {
        setShowForgot(false);
        setForgotPhone('');
        setForgotMessage('');
      }, 3000);
    } catch (err) {
      setForgotMessage('Failed to submit request. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/full_logo.webp" alt="Esena Pharmacy" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Driver Portal</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to manage your deliveries</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassInput
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712345678"
              required
              autoFocus
            />

            <GlassInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <GlassButton
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </GlassButton>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => setShowForgot(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </button>
            <p className="mt-2">Contact admin if you need help</p>
          </div>
        </GlassCard>

        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Reset Password Request
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter your phone number. Your admin will be notified to reset your password.
              </p>
              
              <form onSubmit={handleForgotPassword}>
                <GlassInput
                  label="Phone Number"
                  type="tel"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="0712345678"
                  required
                  autoFocus
                />

                {forgotMessage && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-600 dark:text-blue-400 text-sm">
                    {forgotMessage}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <GlassButton
                    type="submit"
                    loading={forgotLoading}
                    disabled={forgotLoading}
                  >
                    Submit Request
                  </GlassButton>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setForgotPhone('');
                      setForgotMessage('');
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={forgotLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverLogin;
