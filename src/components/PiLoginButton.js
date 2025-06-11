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
        try {
          window.Pi.init({ version: '2.0' });
          setSdkReady(true);
        } catch (e) {
          console.error('❌ Pi.init() failed:', e);
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
        console.error('❌ Pi.init() failed on existing Pi:', e);
      }
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
        console.log('📦 Full auth response:', auth);

        if (!auth?.accessToken) {
          setError('Missing access token from Pi');
          setProcessing(false);
          return;
        }

        try {
          const res = await fetch('/api/pi/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: auth.accessToken }),
          });

          const data = await res.json();
          if (res.ok) {
            console.log('✅ Pi login successful:', data);
            localStorage.setItem('piUser', JSON.stringify(data));
            setUser(data);
          } else {
            console.error('❌ Server rejected Pi login:', data.error);
            setError(data.error);
          }
        } catch (err) {
          console.error('❌ Failed to send accessToken:', err);
          setError('Failed to verify Pi login');
        }

        setProcessing(false);
      }, (error) => {
        console.error('❌ Pi authentication error:', error);
        setError(error.message || 'Pi login failed');
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
      {user && <p className="text-green-500 text-xs">Welcome, {user.username}!</p>}
    </div>
  );
}
