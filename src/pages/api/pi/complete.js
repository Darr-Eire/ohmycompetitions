'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadPiSdk = () => {
      if (window.Pi) {
        window.Pi.init({ version: '2.0' });
        setSdkReady(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.onload = () => {
        try {
          window.Pi.init({ version: '2.0' });
          setSdkReady(true);
        } catch (err) {
          console.error('❌ Pi.init() failed:', err);
        }
      };
      script.onerror = () => console.error('❌ Failed to load Pi SDK');
      document.body.appendChild(script);
    };

    loadPiSdk();
  }, []);

  const login = async () => {
    if (!sdkReady || !window.Pi) throw new Error('Pi SDK not ready');

    // Force fresh login by clearing cached state
    localStorage.removeItem('piUser');
    sessionStorage.clear();
    if (indexedDB?.databases) {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        await indexedDB.deleteDatabase(db.name);
      }
    }

    const onIncompletePaymentFound = async (payment) => {
      console.warn('⚠️ Incomplete payment:', payment);
      return false; // Tell SDK to clear and continue
    };

    try {
      const scopes = ['username', 'payments'];
      const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      if (!auth?.accessToken || !auth.user) {
        throw new Error('Invalid Pi auth response');
      }

      const res = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Token verification failed');
      }

      setUser(data);
      localStorage.setItem('piUser', JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('❌ Pi login failed:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('piUser');
    setUser(null);
  };

  return (
    <PiAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
}
