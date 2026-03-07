import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Protected route wrapper for admin routes
 * Implements Requirements 11.10
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  // Check if token exists and is not expired
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  try {
    // Basic JWT token validation (check if it's not expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp < currentTime) {
      localStorage.removeItem('adminToken');
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    localStorage.removeItem('adminToken');
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;