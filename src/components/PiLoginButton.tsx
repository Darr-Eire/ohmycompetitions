// src/components/PiLoginButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
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
      const { accessToken, user } = await window.Pi.authenticate(
        ['username', 'wallet_address']
      );

      // 2) Tell backend to set session cookie
      const res = await fetch(
        `/api/auth/pi-login?accessToken=${encodeURIComponent(accessToken)}`,
        { method: 'GET', credentials: 'include' }
      );
      if (!res.ok) {
        throw new Error(`Login failed (${res.status})`);
      }

      // 3) Redirect to account page
      router.push('/account');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading} className="btn-blue">
      {loading ? 'Loading…' : error ?? 'Login with Pi Network'}
    </button>
  );
}

