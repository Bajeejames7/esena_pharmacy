import React, { createContext, useContext, useState, useEffect } from 'react';

const DriverAuthContext = createContext(null);

const API = process.env.REACT_APP_API_URL || 'https://esena.co.ke/api';

export const DriverAuthProvider = ({ children }) => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if driver is logged in
    const token = localStorage.getItem('driverToken');
    const storedDriver = localStorage.getItem('driverData');
    
    if (token && storedDriver) {
      try {
        setDriver(JSON.parse(storedDriver));
      } catch (err) {
        localStorage.removeItem('driverToken');
        localStorage.removeItem('driverData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const res = await fetch(`${API}/drivers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('driverToken', data.token);
    localStorage.setItem('driverData', JSON.stringify(data.driver));
    setDriver(data.driver);

    return data;
  };

  const logout = () => {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('driverData');
    setDriver(null);
  };

  const getToken = () => localStorage.getItem('driverToken');

  return (
    <DriverAuthContext.Provider value={{
      driver,
      loading,
      isLoggedIn: !!driver,
      login,
      logout,
      getToken
    }}>
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => {
  const ctx = useContext(DriverAuthContext);
  if (!ctx) throw new Error('useDriverAuth must be used inside DriverAuthProvider');
  return ctx;
};
