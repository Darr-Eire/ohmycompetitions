'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const PiAuthContext = createContext();

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Check if Pi SDK is loaded
    if (typeof window !== 'undefined' && window.Pi) {
      setSdkReady(true);

      const storedUser = localStorage.getItem('piUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const login = async () => {
    try {
      if (!window.Pi) {
        console.error('Pi SDK not available.');
        return;
      }

      const scopes = ['username', 'payments'];
      const user = await window.Pi.authenticate(scopes, (auth) => {
        console.log('✅ Pi Auth callback:', auth);
      });

      if (user && user.uid) {
        localStorage.setItem('piUser', JSON.stringify(user));
        setUser(user);
      } else {
        console.error('❌ Pi login failed.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('piUser');
    setUser(null);
  };

  return (
    <PiAuthContext.Provider value={{ user, sdkReady, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  return useContext(PiAuthContext);
}
