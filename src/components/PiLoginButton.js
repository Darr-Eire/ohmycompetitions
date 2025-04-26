// src/components/PiLoginButton.js
'use client';

import { useState } from 'react';

export default function PiLoginButton({ apiBaseUrl = '/api' }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // On Pi Browser, window.Pi is provided automatically.
      // In other browsers, we mock for dev.
      if (typeof window.Pi?.authenticate !== 'function') {
        // Detect Pi Browser by user agent substring
        const ua = navigator.userAgent || '';
        const inPiBrowser = ua.includes('PiBrowser');
        if (!inPiBrowser) {
          // Dev mock outside Pi Browser
          window.Pi = {
            authenticate: async () => ({
              token: 'dev-token',
              signature: 'dev-sig',
              publicAddress: '0xDEADBEEF',
            }),
          };
        } else {
          throw new Error('Pi.authenticate() not found in Pi Browser');
        }
      }

      // Now we can call it
      const resp = await window.Pi.authenticate();
      const { token, signature, publicAddress } = resp;
      if (!token || !publicAddress) {
        throw new Error('Incomplete auth data from Pi SDK');
      }

      // Send to your backend…
      await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, signature, publicAddress }),
      });

      alert('Login successful!');
    } catch (err) {
      console.error('[PiLoginButton]', err);
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Loading…' : 'Login with Pi'}
    </button>
  );
}
