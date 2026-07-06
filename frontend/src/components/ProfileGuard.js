import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

/**
 * ProfileGuard - Forces logged-in users with incomplete profiles to complete them
 * Blocks access to ALL pages except /complete-profile
 */
const ProfileGuard = ({ children }) => {
  const { firebaseUser, customer, loading, needsProfile } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't do anything while loading
    if (loading) return;

    // If user is logged in and needs profile completion
    if (firebaseUser && needsProfile) {
      // Allow only /complete-profile and /login (to logout)
      const allowedPaths = ['/complete-profile', '/login'];
      
      if (!allowedPaths.includes(location.pathname)) {
        console.log('🔒 Profile incomplete - redirecting to complete profile');
        navigate('/complete-profile', { replace: true });
      }
    }

    // If user completed profile and is on complete-profile page, redirect to account
    if (firebaseUser && customer?.profile_completed && location.pathname === '/complete-profile') {
      console.log('✅ Profile already complete - redirecting to account');
      navigate('/account', { replace: true });
    }
  }, [firebaseUser, customer, needsProfile, loading, location.pathname, navigate]);

  return children;
};

export default ProfileGuard;
