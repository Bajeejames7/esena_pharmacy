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
  const [needsProfile, setNeedsProfile] = useState(false); // new Google user needs extra details

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
          city: extraData.city || null,
          county: extraData.county || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        // If profile has no phone, they need to complete it
        setNeedsProfile(!data.customer.phone);
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
    // If first time (no phone), show profile completion form
    if (!profile?.phone) setNeedsProfile(true);
    return result.user;
  };

  // ── Email sign-in ──────────────────────────────────────────────
  const signInWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await syncProfile(result.user);
    return result.user;
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
    const profile = await syncProfile(firebaseUser, extraData);
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
