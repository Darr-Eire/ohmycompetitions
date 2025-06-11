import { createContext, useContext, useEffect, useState } from 'react';

const PiAuthContext = createContext();

export const PiAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.onload = () => {
      window.Pi.init({ version: '2.0' });
      setSdkReady(true);
    };
    script.onerror = () => console.error('❌ Failed to load Pi SDK');
    document.body.appendChild(script);
  }, []);

  const login = () => {
    return new Promise((resolve, reject) => {
      if (!window?.Pi) return reject('Pi SDK not loaded');

      window.Pi.authenticate(['username', 'payments'], async (auth) => {
        if (!auth?.accessToken) return reject('No access token');

        try {
          const res = await fetch('/api/pi/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: auth.accessToken }),
          });

          const userData = await res.json();
          if (!res.ok) return reject(userData.error);

          setUser(userData);
          localStorage.setItem('piUser', JSON.stringify(userData));
          resolve(userData);
        } catch (err) {
          reject(err.message || 'Verification failed');
        }
      }, (error) => {
        reject(error?.message || 'Login cancelled');
      });
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('piUser');
  };

  useEffect(() => {
    const stored = localStorage.getItem('piUser');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <PiAuthContext.Provider value={{ user, sdkReady, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = () => useContext(PiAuthContext);
