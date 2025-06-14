'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { loadPiSdk } from '../lib/loadPiSdk';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  const login = async () => {
    if (!sdkReady || typeof window.Pi?.authenticate !== 'function') {
      console.warn('❌ Pi SDK not ready');
      alert('Pi SDK not ready yet');
      return;
    }

    try {
      const scopes = ['username', 'payments'];

      const onIncompletePaymentFound = async (payment) => {
        console.warn('⚠️ Incomplete Pi payment:', payment);
        // Handle retry/complete here if needed
      };

      const { accessToken, user: piUser } = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      const res = await axios.post('/api/pi/verify', { accessToken });

      if (res.status === 200) {
        setUser(res.data);
        console.log('✅ Login verified:', res.data);
      } else {
        alert('❌ Login verification failed');
      }
    } catch (err) {
      console.error('❌ Pi Login failed:', err.message || err);
      alert('Pi Login failed');
    }
  };

  return (
    <PiAuthContext.Provider value={{ user, login }}>
      {children}
    </PiAuthContext.Provider>
  );
}
