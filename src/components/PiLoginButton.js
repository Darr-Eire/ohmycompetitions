'use client';
import { useEffect, useState } from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import { usePiEnv } from '../hooks/usePiEnv';

export default function PiLoginButton({ onSuccess }: { onSuccess?: () => void }) {
  const { sdkReady, loginWithPi, loading, error } = usePiAuth();
  const { isPiBrowser } = usePiEnv(); // keep only this; don't rely on hasPi
  const [ready, setReady] = useState(sdkReady);

  // Self-heal if we mounted before the provider flipped to ready
  useEffect(() => {
    let alive = true;
    setReady(sdkReady);
    if (!sdkReady && typeof window !== 'undefined' && (window as any).__readyPi) {
      (window as any).__readyPi().then(() => alive && setReady(true)).catch(() => {});
    }
    return () => { alive = false; };
  }, [sdkReady]);

  const handleLogin = async () => {
    if (!isPiBrowser) {
      alert('Open this site inside the Pi Browser to login with Pi.');
      return;
    }
    // Make absolutely sure the SDK is ready before calling login
    if (typeof window !== 'undefined' && (window as any).__readyPi) {
      try { await (window as any).__readyPi(); } catch {}
    }
    await loginWithPi(onSuccess);
  };

  return (
    <>
      <button
        onClick={handleLogin}
        disabled={!ready || loading}
        className={`btn btn-primary ${(!ready || loading) ? 'opacity-60 cursor-not-allowed' : ''}`}
        aria-busy={loading}
        title={!ready ? 'Loading Pi SDK…' : 'Login with Pi'}
      >
        {!ready ? 'Loading Pi SDK…' : (loading ? 'Authorizing…' : 'Login with Pi')}
      </button>
      {!!error && (
        <p className="mt-1 text-xs text-rose-300 text-center">{String(error)}</p>
      )}
    </>
  );
}
