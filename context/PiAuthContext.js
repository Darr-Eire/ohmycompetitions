'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const PiAuthContext = createContext();

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [piSdkReady, setPiSdkReady] = useState(false);

  // Load Pi SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      if (window?.Pi) {
        window.Pi.init({ version: '2.0' });
        setPiSdkReady(true);
        console.log('✅ Pi SDK loaded');
      }
    };
    document.body.appendChild(script);
  }, []);

  const loginWithPi = async () => {
    if (!window?.Pi || !piSdkReady) {
      alert('Pi SDK not ready.');
      return;
    }

    try {
      const piUser = await window.Pi.authenticate(['username', 'payments'], (incompletePayment) => {
        console.log('🟡 Incomplete payment:', incompletePayment);
      });

      const res = await fetch('/api/verify-pi-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: piUser.accessToken }),
      });

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        console.log('✅ Pi user verified and stored:', data.user);
      } else {
        alert('Login failed: invalid response');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('Login failed.');
    }
  };

  return (
    <PiAuthContext.Provider value={{ user, loginWithPi }}>
      {children}
    </PiAuthContext.Provider>
  );
}

export const usePiAuth = () => useContext(PiAuthContext);
