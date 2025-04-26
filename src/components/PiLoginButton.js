'use client';

import { useState } from 'react';

export default function PiLoginButton({ apiBaseUrl = '/api/auth/pi-login' }) {
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

      console.log('Authenticated:', auth);

      // Build a GET URL with the accessToken
      const url = new URL(apiBaseUrl, window.location.origin);
      url.searchParams.set('accessToken', auth.accessToken);

      const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
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
