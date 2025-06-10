'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

async function loadPiSdk() {
  if (typeof window === 'undefined') throw new Error('Not client side');
  if (window.Pi) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pi SDK'));
    document.body.appendChild(script);
  });
}

export function PiAuthProvider({ children }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = 'piUser';

  useEffect(() => {
    async function init() {
      try {
        await loadPiSdk();
        window.Pi.init({ version: '2.0' });
        setSdkReady(true);
        console.log('✅ Pi SDK loaded');

        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('❌ Failed to load SDK:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function login() {
    if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
      alert('⚠️ Pi SDK not ready.');
      return;
    }

    try {
      const result = await window.Pi.authenticate(
        ['username', 'payments'],
        async (incompletePayment) => {
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
        }
      );

      // Save result
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
      setUser(result.user);
      console.log('✅ Login complete:', result.user);
    } catch (err) {
      console.error('❌ Login failed:', err);
      alert('Pi Login failed – see console');
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    if (window.Pi?.logout) window.Pi.logout();
  }

  const value = { user, login, logout, loading, sdkReady };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl font-bold">
        Connecting to Pi...
      </div>
    );
  }

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
}
