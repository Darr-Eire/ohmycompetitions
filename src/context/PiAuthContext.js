'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Load SDK and restore session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('piUser');
    if (saved) {
      setUser(JSON.parse(saved));
    }

    const loadSdk = () => {
      if (!window.Pi) {
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
      } else {
        try {
          window.Pi.init({ version: '2.0' });
          setSdkReady(true);
        } catch (err) {
          console.error('❌ Pi.init() failed:', err);
        }
      }
    };

    loadSdk();
  }, []);

  const login = async () => {
    if (!sdkReady || !window.Pi) throw new Error('Pi SDK not ready');

    // Clear previous session to force re-auth
    localStorage.removeItem('piUser');
    sessionStorage.clear();
    if (indexedDB?.databases) {
      const dbs = await indexedDB.databases();
      dbs.forEach((db) => indexedDB.deleteDatabase(db.name));
    }

    try {
      const scopes = ['username', 'payments'];
      const auth = await window.Pi.authenticate(scopes, () => {});
      if (!auth?.user) throw new Error('Login failed: No user returned');

      setUser(auth.user);
      localStorage.setItem('piUser', JSON.stringify(auth.user));
      return auth.user;
    } catch (err) {
      console.error('❌ Pi login failed:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('piUser');
  };

  return (
    <PiAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
}
