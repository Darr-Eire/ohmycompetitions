'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const PiAuthContext = createContext();

// Export custom hook to access context
export function usePiAuth() {
  return useContext(PiAuthContext);
}

// Helper to load Pi SDK
function loadPiSdk(setSdkReady) {
  if (typeof window === 'undefined') return;

  if (window.Pi) {
    setSdkReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.onload = () => {
    window.Pi.init({ version: '2.0' }); // ✅ Required for v2
    setSdkReady(true);
  };
  script.onerror = () => {
    console.error('❌ Failed to load Pi SDK');
  };
  document.body.appendChild(script);
}

// Auth Provider component
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
    if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
      alert('⚠️ Pi SDK not ready. Use the Pi Browser.');
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

      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
    } catch (err) {
      console.error('❌ Pi authentication failed:', err);
      alert('Login failed. See console.');
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    if (window.Pi?.logout) window.Pi.logout(); // Optional: also clear Pi SDK session
  }

  const value = { user, login, logout, loading, sdkReady };

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
}
