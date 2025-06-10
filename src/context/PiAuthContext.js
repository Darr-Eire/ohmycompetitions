'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const PiAuthContext = createContext();

export const PiAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('piUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: '2.0' });
        setSdkReady(true);
      }
    };
    document.body.appendChild(script);
  }, []);

  const login = async () => {
    try {
      const result = await window.Pi.authenticate(['username', 'payments'], payment => {
        console.warn('⚠️ Incomplete payment found', payment);
      });

      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: result.accessToken }),
      });

      if (!res.ok) throw new Error('Server login failed');

      setUser(result.user);
      localStorage.setItem('piUser', JSON.stringify(result.user));
    } catch (err) {
      console.error('❌ Pi login failed:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('piUser');
    document.cookie = 'pi.accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    window.Pi?.logout?.();
  };

  return (
    <PiAuthContext.Provider value={{ user, sdkReady, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = () => useContext(PiAuthContext);
