'use client';
import { useState } from 'react';

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (typeof window.Pi?.authenticate !== 'function') {
      setError('Pi SDK not available. Open in Pi Browser.');
      setLoading(false);
      return;
    }

    try {
      const auth = await window.Pi.authenticate({
        version: '2.0',
        permissions: ['username', 'wallet_address'],
      });

      if (!auth.accessToken) {
        throw new Error('No access token returned');
      }

      const resp = await fetch(
        `/api/auth/pi-login?accessToken=${encodeURIComponent(
          auth.accessToken
        )}`,
        { method: 'GET', credentials: 'include' }
      );
      if (!resp.ok) {
        throw new Error(`Login API failed: ${resp.status}`);
      }

      alert('Logged in!');
    } catch (e: any) {
      setError(e.message);
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
      {loading
        ? 'Waiting for Pi SDK...'
        : error
        ? error
        : 'Login with Pi Network'}
    </button>
  );
}
