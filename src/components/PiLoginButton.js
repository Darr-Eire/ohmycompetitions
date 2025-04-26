// src/components/PiLoginButton.js
'use client';

import { useState, useEffect } from 'react';

export default function PiLoginButton({ apiBaseUrl = '/api' }) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  // Poll for Pi SDK to load
  useEffect(() => {
    let interval = setInterval(() => {
      if (typeof window.Pi?.authenticate === 'function') {
        clearInterval(interval);
        setSdkReady(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!sdkReady) {
        throw new Error('Pi SDK not yet ready—please try again in a moment.');
      }

      const scopes = ['username', 'wallet_address'];
      const auth = await window.Pi.authenticate(scopes);

      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });

      if (!res.ok) {
        throw new Error(`Login API failed: ${res.status}`);
      }

      alert('Logged in!');
    } catch (err) {
      console.error(err);
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading || !sdkReady}
    >
      {loading
        ? 'Loading…'
        : sdkReady
        ? 'Login with Pi'
        : 'Waiting for Pi SDK…'}
    </button>
  );
}
