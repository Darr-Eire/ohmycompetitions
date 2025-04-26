'use client';
import { useState } from 'react';

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      if (typeof window.Pi?.authenticate !== 'function') {
        throw new Error('Pi SDK not available – open in Pi Browser.');
      }

      const { accessToken, user } = await window.Pi.authenticate(
        ['username', 'wallet_address'],
        (payment) => {
          console.warn('Incomplete payment found', payment);
        }
      );

      // verify on backend
      const resp = await fetch('/api/auth/pi-verify', {
        method:  'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error('Token invalid or expired');
        throw new Error(`Verification failed: ${resp.status}`);
      }

      const me = await resp.json();
      alert(`Welcome, ${me.username}!`);

    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading ? '…Loading' : error ?? 'Login with Pi'}
    </button>
  );
}
