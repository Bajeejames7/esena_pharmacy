import React, { useCallback } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import useIdleTimeout from '../hooks/useIdleTimeout';

/**
 * Protected route wrapper for admin routes with enhanced security
 * Implements Requirements 11.10
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const handleTimeout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login', { state: { from: location, sessionExpired: true }, replace: true });
  }, [navigate, location]);

  useIdleTimeout(handleTimeout);
  
  // Check if token exists
  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // Validate token format and expiration
  if (!isValidToken(token)) {
    // Clean up invalid token
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return children;
};

/**
 * Validates JWT token format and expiration
 * @param {string} token - JWT token to validate
 * @returns {boolean} - True if token is valid
 */
const isValidToken = (token) => {
  try {
    // Handle demo token
    if (token === 'mock-jwt-token') {
      return true;
    }
    
    // Validate JWT structure
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Decode and validate payload
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token has expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    // Check if token has required fields
    if (!payload.userId || !payload.role) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export default ProtectedRoute;