'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const PiAuthContext = createContext();

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [piSdkReady, setPiSdkReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: '2.0' });
        setPiSdkReady(true);
        console.log('✅ Pi SDK initialized');
      } else {
        alert('❌ Pi SDK failed to initialize');
      }
    };
    document.body.appendChild(script);
  }, []);

  const loginWithPi = async () => {
    if (!piSdkReady || !window.Pi) {
      alert('Pi SDK not ready');
      return;
    }

    try {
      const user = await window.Pi.authenticate(['username', 'payments']);
      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: user.accessToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      alert(`✅ Logged in as ${data.user.username}`);
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('Login failed: ' + err.message);
    }
  };

  const logout = () => {
    setUser(null);
    alert('Logged out');
  };

  return (
    <PiAuthContext.Provider value={{ user, loginWithPi, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  return useContext(PiAuthContext);
}
