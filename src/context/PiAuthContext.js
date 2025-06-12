'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Load Pi SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Pi) {
      window.Pi.init({ version: '2.0', sandbox: true });
      setSdkReady(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.onload = () => {
        window.Pi.init({ version: '2.0', sandbox: true });
        setSdkReady(true);
      };
      document.body.appendChild(script);
    }
  }, []);

  const login = async () => {
    if (!sdkReady || !window.Pi) {
      alert('⚠️ Pi SDK not ready');
      return;
    }

    try {
      const scopes = ['username', 'payments'];
      const onIncompletePaymentFound = async (payment) => {
        console.warn('⚠️ Incomplete payment:', payment);

        if (payment.transaction?.txid) {
          await axios.post('/api/pi/complete-payment', {
            paymentId: payment.identifier,
            txid: payment.transaction.txid,
          });
        }
      };

      const { accessToken, user } = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const res = await axios.post('/api/pi/verify', { accessToken });

      if (res.ok) {
        setUser(res.data);
        console.log('✅ Logged in:', res.data);
      } else {
        console.warn('❌ Backend verification failed');
      }
    } catch (err) {
      console.error('❌ Login failed:', err.message);
    }
  };

  return (
    <PiAuthContext.Provider value={{ user, login, sdkReady }}>
      {children}
    </PiAuthContext.Provider>
  );
}
