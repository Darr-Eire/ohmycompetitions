// src/components/PiLoginButton.js
'use client';
import { useEffect, useState } from 'react';
import { usePiAuth } from '../context/PiAuthContext';

export default function PiLoginButton({ onSuccess }) {
  const { sdkReady, loginWithPi, loading, error } = usePiAuth();

  const [ready, setReady] = useState(sdkReady);
  const [isPiBrowser, setIsPiBrowser] = useState(false);

  // Detect Pi Browser safely on client
  useEffect(() => {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    const ref = (typeof document !== 'undefined' && document.referrer) || '';
    const winName = (typeof window !== 'undefined' && window.name) || '';
    const isPi = /PiBrowser/i.test(ua) || /minepi\.com/i.test(ref) || winName === 'pi_browser';
    setIsPiBrowser(isPi);
  }, []);

  // Self-heal if mounted before sdkReady flips
  useEffect(() => {
    let alive = true;
    setReady(sdkReady);
    if (!sdkReady && typeof window !== 'undefined' && window.__readyPi) {
      window.__readyPi().then(() => alive && setReady(true)).catch(() => {});
    }
    return () => { alive = false; };
  }, [sdkReady]);

  const handleLogin = async () => {
    if (!isPiBrowser) {
      alert('Open this site inside the Pi Browser to login with Pi.');
      return;
    }
    if (typeof window !== 'undefined' && window.__readyPi) {
      try { await window.__readyPi(); } catch {}
    }
    await loginWithPi(onSuccess);
  };

  return (
    <>
      <button
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
