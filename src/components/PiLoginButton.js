'use client';

import React, { useEffect, useState } from 'react';

export default function PiLoginButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load existing user from localStorage
    const saved = localStorage.getItem('piUser');
    if (saved) {
      setUser(JSON.parse(saved));
    }

    // Load and init Pi SDK
    const loadSdk = () => {
      if (!window.Pi) {
        const script = document.createElement('script');
        script.src = 'https://sdk.minepi.com/pi-sdk.js';
        script.onload = () => {
          try {
            window.Pi.init({ version: '2.0' });
            setSdkReady(true);
          } catch (e) {
            console.error('❌ Pi.init() failed:', e);
            setError('SDK init error');
          }
        };
        script.onerror = () => {
          console.error('❌ Failed to load Pi SDK');
          setError('Failed to load Pi SDK');
        };
        document.body.appendChild(script);
      } else {
        try {
          window.Pi.init({ version: '2.0' });
          setSdkReady(true);
        } catch (e) {
          console.error('❌ Pi.init() failed:', e);
        }
      }
    };

    loadSdk();
  }, []);

  const verifyToken = async (accessToken) => {
    try {
      const res = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('piUser', JSON.stringify(data));
        setUser(data);
        return true;
      } else {
        console.error('❌ Pi verify failed:', data.error);
        setError(data.error || 'Verify failed');
        return false;
      }
    } catch (err) {
      console.error('❌ Verify error:', err);
      setError('Verification failed');
      return false;
    }
  };

  const handleLogin = async () => {
    if (!sdkReady || !window.Pi) {
      setError('Pi SDK not ready');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const auth = await window.Pi.authenticate(['username', 'payments']);
      if (!auth?.accessToken) throw new Error('Missing access token');
      await verifyToken(auth.accessToken);
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleLogin}
        disabled={processing || !sdkReady}
        className="neon-button text-xs px-4 py-2 mb-2 disabled:opacity-50"
      >
        {processing ? 'Logging in...' : 'Login with Pi'}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {user && <p className="text-green-500 text-xs">Welcome, {user.username}!</p>}
    </div>
  );
}
