'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Pi) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.onload = () => {
      window.Pi.init({ version: '2.0' });
      setSdkReady(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Pi SDK');
    };
    document.body.appendChild(script);
  }, []);

  const loginWithPi = async () => {
    if (!sdkReady || !window.Pi) {
      console.error('❌ Pi SDK not ready');
      return;
    }

    try {
      const scopes = ['username', 'payments'];
      const onIncompletePaymentFound = (payment) => {
        console.log('⚠️ Incomplete payment:', payment);
      };

      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const accessToken = authResult.accessToken;

      const res = await axios.post('/api/pi/verify', { accessToken });
      setUser(res.data);
    } catch (error) {
      console.error('❌ Pi login error:', error);
    }
  };

  return (
    <PiAuthContext.Provider value={{ user, loginWithPi, sdkReady, loading }}>
      {children}
    </PiAuthContext.Provider>
  );
}
