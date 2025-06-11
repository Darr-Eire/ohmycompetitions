'use client';

import React, { useEffect, useState } from 'react';

export default function PiLoginButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.Pi) {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.onload = () => {
        window.Pi.init({ version: '2.0' });
        setSdkReady(true);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Pi SDK');
        setError('Failed to load Pi SDK');
      };
      document.body.appendChild(script);
    } else {
      setSdkReady(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!sdkReady || !window.Pi) {
      setError('Pi SDK not ready');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      window.Pi.authenticate(['username', 'payments'], async (auth) => {
        if (!auth.accessToken) {
          setError('Missing access token');
          setProcessing(false);
          return;
        }

        const res = await fetch('/api/pi/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: auth.accessToken }),
        });

        const data = await res.json();
        if (res.ok) {
          console.log('✅ Pi login successful:', data);
          setUser(data);
          localStorage.setItem('piUser', JSON.stringify(data));
        } else {
          console.error('❌ Server rejected Pi login:', data.error);
          setError(data.error || 'Login failed');
        }
        setProcessing(false);
      }, (err) => {
        console.error('❌ Pi login cancelled or failed:', err);
        setError(err.message || 'Login cancelled');
        setProcessing(false);
      });
    } catch (err) {
      console.error('❌ Unexpected login error:', err);
      setError('Unexpected error occurred');
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
      {user && (
        <p className="text-green-500 text-xs">Welcome, {user.username}!</p>
      )}
    </div>
  );
}
