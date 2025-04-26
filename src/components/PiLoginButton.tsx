// src/components/PiLoginButton.tsx
'use client';

import { useState, useEffect } from 'react';

type AuthResult = {
  accessToken: string;
  user: { uid: string; username: string };
};

declare global {
  interface Window {
    Pi?: {
      init: (opts: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound?: (p: any) => void
      ) => Promise<AuthResult>;
    };
  }
}

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Poll for Pi.init having run in the head
  useEffect(() => {
    const id = setInterval(() => {
      if (window.Pi && typeof window.Pi.authenticate === 'function') {
        setSdkReady(true);
        clearInterval(id);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    if (!sdkReady) {
      setError('Waiting for Pi SDK to initialize…');
      setLoading(false);
      return;
    }

    try {
      // TS now knows Pi is defined:
      const { accessToken, user } = await window.Pi!.authenticate(
        ['username', 'wallet_address'],
        (payment) => console.warn('Incomplete payment:', payment)
      );

      const res = await fetch(
        `/api/auth/pi-login?accessToken=${encodeURIComponent(accessToken)}`,
        { method: 'GET', credentials: 'include' }
      );
      if (!res.ok) throw new Error(`Login failed (${res.status})`);

      // redirect on success:
      window.location.href = '/account';
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading || !sdkReady}
      className="btn-blue"
    >
      {loading
        ? 'Loading…'
        : !sdkReady
        ? 'Initializing Pi SDK…'
        : error ?? 'Login with Pi Network'}
    </button>
  );
}
