'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const PiAuthContext = createContext(null);

async function waitForPiSDK(maxMs = 8000) {
  const start = Date.now();
  while (typeof window === 'undefined' || !window.Pi) {
    if (Date.now() - start > maxMs) throw new Error('Pi SDK not loaded');
    await new Promise(r => setTimeout(r, 120));
  }
  return window.Pi;
}
async function ensurePiInit({ sandbox = false, network = 'Pi Testnet' } = {}) {
  const Pi = await waitForPiSDK();
  if (!window.__piInitDone) {
    await Pi.init({ version: '2.0', network, sandbox });
    window.__piInitDone = true;
  }
  return Pi;
}
function withTimeout(promise, ms = 10000, label = 'operation') {
  const t = new Promise((_, rej) =>
    setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, t]);
}

export function PiAuthProvider({ children }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initOnce = useRef(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('omc_jwt');
      if (token) setJwt(token);
      const cachedUser = localStorage.getItem('omc_user');
      if (cachedUser) setUser(JSON.parse(cachedUser));
    } catch {}
  }, []);

  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;
    (async () => {
      try {
        const sandbox = String(process.env.NEXT_PUBLIC_PI_SANDBOX || '').toLowerCase() === 'true';
        const env = String(process.env.NEXT_PUBLIC_PI_ENV || 'testnet').toLowerCase();
        const network = env === 'mainnet' ? 'Pi Network' : 'Pi Testnet';
        await ensurePiInit({ sandbox, network });
        setSdkReady(true);
      } catch (e) {
        console.error('[Pi] init failed:', e);
        setError(e.message || 'Pi SDK init failed');
      }
    })();
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!sdkReady) throw new Error('Pi SDK not ready yet');

      const Pi = await waitForPiSDK();
      const auth = await withTimeout(
        Pi.authenticate(['username', 'payments', 'roles']),
        10000,
        'Pi.authenticate'
      );
      const accessToken = auth?.accessToken || '';
      if (!accessToken) throw new Error('No access token from Pi');

      // Use /api/pi/verify OR change route to match your server
      const resp = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) {
        throw new Error(data?.error || `Verify failed (HTTP ${resp.status})`);
      }

      const me = data.user;
      if (me) {
        try { localStorage.setItem('omc_user', JSON.stringify(me)); } catch {}
        setUser(me);
      }
      // optional JWT if you mint one later
      return { ok: true, me, token: null };
    } catch (e) {
      const raw = e?.message || 'Login failed';
      const friendly = /user canceled/i.test(raw) ? 'Login cancelled by user.' : raw;
      setError(friendly);
      console.error('[PiAuth] login error:', raw);
      return { ok: false, error: friendly };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('omc_jwt');
      localStorage.removeItem('omc_user');
    } catch {}
    setJwt(null);
    setUser(null);
    setError(null);
  };

  const loginWithPi = login; // alias for your Header

  return (
    <PiAuthContext.Provider
      value={{ sdkReady, user, jwt, loading, error, login, loginWithPi, logout }}
    >
      {children}
    </PiAuthContext.Provider>
  );
}

export const usePiAuth = () => useContext(PiAuthContext);