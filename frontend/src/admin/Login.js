import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateField } from '../utils/validation';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassButton from '../components/forms/GlassButton';

/**
 * Admin login page with enhanced authentication
 * Implements Requirements 10.1, 10.2, 10.9, 10.10
 */
const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token && isValidToken(token)) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const isValidToken = (token) => {
    try {
      if (token === 'mock-jwt-token') return true; // Demo token
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validation = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? null : validation.error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!credentials.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call to backend auth endpoint
      console.log('Admin login attempt:', { username: credentials.username });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo authentication logic
      if (credentials.username === 'admin' && credentials.password === 'password') {
        // Generate mock JWT token with expiration
        const mockToken = generateMockJWT();
        localStorage.setItem('adminToken', mockToken);
        
        // Store user info
        localStorage.setItem('adminUser', JSON.stringify({
          username: credentials.username,
          role: 'admin',
          loginTime: new Date().toISOString()
        }));
        
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password. Use admin/password for demo.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockJWT = () => {
    // Create a mock JWT token for demo purposes
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      username: credentials.username,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white">
      <div className="max-w-md w-full">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-gray-800 mb-2">Admin Login</h1>
            <p className="text-gray-600">Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassInput
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.username}
              required
              autoComplete="username"
              placeholder="Enter your username"
            />

            <GlassInput
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />

            {error && (
              <div className="p-4 bg-red-100/50 border border-red-200 rounded-lg text-red-700">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <GlassButton
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </GlassButton>
          </form>

          <div className="mt-8 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Demo Credentials</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p><strong>Username:</strong> admin</p>
              <p><strong>Password:</strong> password</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              ← Back to Main Site
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminLogin;