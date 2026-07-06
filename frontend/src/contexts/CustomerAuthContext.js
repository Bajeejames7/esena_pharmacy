import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const CustomerAuthContext = createContext(null);

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);   // DB profile
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false); // Will be set after profile sync

  // Sync Firebase auth state → fetch/create DB profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncProfile(fbUser);
      } else {
        setCustomer(null);
        setNeedsProfile(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Sync FB user with backend profile ─────────────────────────
  const syncProfile = async (fbUser, extraData = {}) => {
    try {
      const token = await fbUser.getIdToken();
      const res = await fetch(`${API}/customers/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: fbUser.displayName || extraData.name,
          phone: extraData.phone || null,
          delivery_address: extraData.delivery_address || null,
          landmark: extraData.landmark || null,
          city: extraData.city || null,
          county: extraData.county || null,
          date_of_birth: extraData.date_of_birth || null,
          blood_type: extraData.blood_type || null,
          chronic_conditions: extraData.chronic_conditions || null,
          allergies: extraData.allergies || null,
          emergency_contact_name: extraData.emergency_contact_name || null,
          emergency_contact_phone: extraData.emergency_contact_phone || null,
          profile_completed: extraData.profile_completed || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        // Profile is incomplete if required fields are missing or profile_completed is false
        const needsCompletion = !data.customer.profile_completed || 
                                !data.customer.phone || 
                                !data.customer.delivery_address ||
                                !data.customer.city ||
                                !data.customer.county;
        console.log('🔍 Profile Sync Check:', {
          profile_completed: data.customer.profile_completed,
          phone: !!data.customer.phone,
          delivery_address: !!data.customer.delivery_address,
          city: !!data.customer.city,
          county: !!data.customer.county,
          needsCompletion
        });
        setNeedsProfile(needsCompletion);
        return data.customer;
      }
    } catch (err) {
      console.error('Profile sync error:', err);
    }
    return null;
  };

  // ── Google sign-in ─────────────────────────────────────────────
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await syncProfile(result.user);
    // Return whether profile needs completion
    return {
      user: result.user,
      needsProfile: !profile?.profile_completed || !profile?.phone || !profile?.delivery_address || !profile?.city || !profile?.county
    };
  };

  // ── Email sign-in ──────────────────────────────────────────────
  const signInWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await syncProfile(result.user);
    return {
      user: result.user,
      needsProfile: !profile?.profile_completed || !profile?.phone || !profile?.delivery_address || !profile?.city || !profile?.county
    };
  };

  // ── Email sign-up ──────────────────────────────────────────────
  const signUpWithEmail = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(result.user, { displayName: name });
    setNeedsProfile(true); // always collect phone + address on signup
    return result.user;
  };

  // ── Complete profile (after Google sign-in or email sign-up) ──
  const completeProfile = async (extraData) => {
    if (!firebaseUser) return;
    const profile = await syncProfile(firebaseUser, { ...extraData, profile_completed: true });
    setNeedsProfile(false);
    return profile;
  };

  // ── Refresh profile from DB ────────────────────────────────────
  const refreshProfile = async () => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${API}/customers/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setCustomer(data.customer);
    } catch (_) {}
  };

  // ── Get Firebase ID token for API calls ───────────────────────
  const getToken = async () => {
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  };

  // ── Sign out ───────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setCustomer(null);
    setFirebaseUser(null);
    setNeedsProfile(false);
  };

  return (
    <CustomerAuthContext.Provider value={{
      customer,
      firebaseUser,
      loading,
      needsProfile,
      isLoggedIn: !!firebaseUser,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      completeProfile,
      refreshProfile,
      getToken,
      logout,
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  return ctx;
};
