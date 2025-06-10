'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Context setup
const PiAuthContext = createContext();
export function usePiAuth() {
  return useContext(PiAuthContext);
}

// Helper to load the SDK if Pi Browser doesn't auto-load it
function loadPiSdk(setSdkReady) {
  if (typeof window === 'undefined') return;

  if (window.Pi) {
    console.log('✅ Pi SDK already loaded');
    setSdkReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.defer = true;
  script.onload = () => {
    if (window.Pi) {
      console.log('✅ Pi SDK loaded from fallback script');
      window.Pi.init({ version: '2.0' }); // Required for v2 SDK
      setSdkReady(true);
    } else {
      console.error('❌ Pi SDK script loaded but window.Pi not available');
    }
  };
  script.onerror = () => {
    console.error('❌ Failed to load Pi SDK script');
  };

  document.body.appendChild(script);
}

export function PiAuthProvider({ children }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const STORAGE_KEY = 'piUser';

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  async function login() {
    console.log('🧪 login() called');

    if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
      alert('⚠️ Pi SDK not ready. Use the Pi Browser.');
      console.warn('🧪 SDK Ready:', sdkReady, 'window.Pi:', window.Pi);
      return;
    }

    try {
      const scopes = ['username', 'payments'];
      const result = await window.Pi.authenticate(scopes, async (incompletePayment) => {
        console.warn('⚠️ Incomplete payment found:', incompletePayment);
        if (incompletePayment?.identifier && incompletePayment?.transaction?.txid) {
          await fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: incompletePayment.identifier,
              txid: incompletePayment.transaction.txid,
            }),
          });
        }
      });

      console.log('✅ Pi Login Success:', result.user);
      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
    } catch (err) {
      console.error('❌ Pi authentication failed:', err);
      alert('Login failed. See console.');
    }
  }

  function logout() {
    console.log('👋 Logging out user:', user?.username);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    if (window.Pi?.logout) window.Pi.logout(); // Optional
  }

  const value = { user, login, logout, loading, sdkReady };

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
}
