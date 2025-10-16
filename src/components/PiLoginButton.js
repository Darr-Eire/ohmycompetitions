'use client';

import { useState, useEffect } from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import { usePiEnv } from '../hooks/usePiEnv';

export default function PiLoginButton({ onSuccess }) {
  const { sdkReady, loginWithPi, loading, error } = usePiAuth();
  const { isPiBrowser } = usePiEnv(); // only need to know if we’re in Pi Browser
  const [ready, setReady] = useState(sdkReady);

  useEffect(() => {
    setReady(sdkReady);
  }, [sdkReady]);

  const handleLogin = async () => {
    // If not in Pi Browser, tell the user early
    if (!isPiBrowser) {
      alert('Open in Pi Browser to login with Pi.');
      return;
    }
    // Trust the context to have initialized the SDK (_document/_app handle script injection)
    try {
      const res = await loginWithPi(onSuccess);
      if (!res?.ok && res?.error) {
        alert(res.error);
      }
    } catch (e) {
      alert('Login failed.');
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="btn btn-primary"
      disabled={!ready || loading}
      aria-busy={loading}
      title={ready ? 'Login with Pi' : 'Loading Pi SDK…'}
    >
      {ready ? (loading ? 'Authorizing…' : 'Login with Pi') : 'Loading Pi SDK…'}
    </button>
  );
}
