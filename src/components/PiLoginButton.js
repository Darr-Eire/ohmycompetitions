'use client';

import { useState, useEffect } from 'react';

export default function PiLoginButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  // Load SDK and init Pi
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Pi && typeof window.Pi.authenticate === 'function') {
      initPiSdk();
    } else {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => {
        initPiSdk();
      };
      document.body.appendChild(script);
    }

    function initPiSdk() {
      const sandbox = true; // Change to false for production
      window.Pi.init({ version: '2.0', sandbox });
      setSdkReady(true);
      console.log('✅ Pi SDK initialized');
    }
  }, []);

  const loginWithPi = async () => {
    if (!sdkReady || !window.Pi || typeof window.Pi.authenticate !== 'function') {
      alert('⚠️ Pi SDK not ready or not inside Pi Browser.');
      return;
    }

    setLoading(true);

    try {
      const scopes = ['username', 'payments'];

      const onIncompletePaymentFound = (payment) => {
        console.warn('⚠️ Incomplete payment found:', payment);
      };

      const { accessToken, user: piUser } = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      const res = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!res.ok) throw new Error('❌ Pi login backend verification failed');

      const verifiedUser = await res.json();
      setUser(verifiedUser);
      console.log('✅ Pi login successful:', verifiedUser);
    } catch (err) {
      console.error('❌ Pi login failed:', err);
      alert('Pi login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={loginWithPi}
      disabled={loading || !sdkReady}
      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition"
    >
      {user
        ? `Logged in as ${user.username}`
        : loading
        ? 'Logging in...'
        : 'Login with Pi'}
    </button>
  );
}
