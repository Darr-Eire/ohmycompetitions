// src/components/PiLoginButton.js
'use client';

import { useState } from 'react';

export default function PiLoginButton({ apiBaseUrl = '/api' }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (typeof window.Pi?.authenticate !== 'function') {
        throw new Error('Pi SDK not available. Please open in the Pi Browser.');
      }

      // Request username & wallet_address
      const scopes = ['username', 'wallet_address'];
      const auth = await Pi.authenticate(scopes);

      // auth is { accessToken, user: { uid, username, wallet_address } }
      console.log('Authenticated:', auth);

      // Send the accessToken to your backend for your /api/auth/login
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
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Loading…' : 'Login with Pi'}
    </button>
  );
}
