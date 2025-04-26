'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (typeof window.Pi?.authenticate !== 'function') {
      setError('Pi SDK not available. Open in Pi Browser.');
      setLoading(false);
      return;
    }

    try {
      // 1) Authenticate via Pi SDK
      const { accessToken, user } = await window.Pi.authenticate([
        'username',
        'wallet_address',
      ]);

      // 2) Send token to our backend to set a session cookie
      const res = await fetch(
        `/api/auth/pi-login?accessToken=${encodeURIComponent(
          accessToken
        )}`,
        { method: 'GET', credentials: 'include' }
      );
      if (!res.ok) throw new Error(`Login failed (${res.status})`);

      // *** Redirect to /account ***
      router.push('/account');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Login failed');
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
      {loading ? 'Loading…' : error ?? 'Login with Pi Network'}
    </button>
  );
}
