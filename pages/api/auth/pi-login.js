'use client';
import { useState } from 'react';

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      if (typeof window.Pi?.authenticate !== 'function') {
        throw new Error('Pi SDK not available – open in Pi Browser.');
      }
      const { accessToken, user } = await window.Pi.authenticate(
        ['username', 'wallet_address'],
        (payment) => console.warn('Incomplete payment:', payment)
      );

      const resp = await fetch(
        `/api/auth/pi-login?accessToken=${encodeURIComponent(accessToken)}`,
        { method: 'GET', credentials: 'include' }
      );
      if (!resp.ok) throw new Error(`Login API failed: ${resp.status}`);

      alert(`Welcome, ${user.username}!`);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? '…Loading' : error || 'Login with Pi'}
    </button>
  );
}
