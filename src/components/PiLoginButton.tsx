// src/components/PiLoginButton.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (!window.Pi || typeof window.Pi.authenticate !== 'function') {
      setError('Pi SDK not available. Open in Pi Browser.');
      setLoading(false);
      return;
    }

    try {
      const { accessToken, user } = await window.Pi.authenticate(
        ['username', 'wallet_address']
      );

      const res = await fetch(
        `/api/auth/pi-login?accessToken=${encodeURIComponent(accessToken)}`,
        { method: 'GET', credentials: 'include' }
      );
      if (!res.ok) throw new Error(`Login failed (${res.status})`);

      // on success, redirect to /account
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
