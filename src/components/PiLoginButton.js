'use client';

import React, { useEffect, useState } from 'react';

export default function PiLoginButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('piUser');
    if (saved) setUser(JSON.parse(saved));

    const loadSdk = () => {
      if (!window.Pi) {
        const script = document.createElement('script');
        script.src = 'https://sdk.minepi.com/pi-sdk.js';
        script.onload = () => {
          try {
            window.Pi.init({ version: '2.0' });
            setSdkReady(true);
          } catch (e) {
            console.error('❌ Pi.init() failed:', e);
            setError('SDK init error');
          }
        };
        script.onerror = () => {
          console.error('❌ Failed to load Pi SDK');
          setError('Failed to load Pi SDK');
        };
        document.body.appendChild(script);
      } else {
        try {
          window.Pi.init({ version: '2.0' });
          setSdkReady(true);
        } catch (e) {
          console.error('❌ Pi.init() failed:', e);
          setError('SDK init error');
        }
      }
    };

    loadSdk();
  }, []);

  const onIncompletePaymentFound = async (payment) => {
    console.warn('⚠️ Incomplete payment found:', payment);

    try {
      const res = await fetch('/api/pi/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.identifier,
          txid: 'sandbox-completed-txid', // Replace with real txid if needed
        }),
      });

      const data = await res.json();
      console.log('✅ Stuck payment completed:', data);
    } catch (err) {
      console.error('❌ Failed to resolve stuck payment:', err);
    }

    return false; // Tell SDK to clear and continue
  };

  const verifyToken = async (accessToken) => {
    try {
      const res = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      localStorage.setItem('piUser', JSON.stringify(data));
      setUser(data);
      return true;
    } catch (err) {
      console.error('❌ Token verification failed:', err);
      setError(err.message || 'Verification failed');
      return false;
    }
  };

  const handleLogin = async () => {
    if (!sdkReady || !window.Pi) {
      setError('Pi SDK not ready');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      localStorage.removeItem('piUser');
      sessionStorage.clear();
      if (indexedDB?.databases) {
        const dbs = await indexedDB.databases();
        for (const db of dbs) await indexedDB.deleteDatabase(db.name);
        console.log('✅ Cleared IndexedDB');
      }

      const auth = await window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
      if (!auth?.accessToken) throw new Error('Missing access token');
      await verifyToken(auth.accessToken);
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleLogin}
        disabled={processing || !sdkReady}
        className="neon-button text-xs px-4 py-2 mb-2 disabled:opacity-50"
      >
        {processing ? 'Logging in...' : 'Login with Pi'}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {user && <p className="text-green-500 text-xs">Welcome, {user.username}!</p>}
    </div>
  );
}
