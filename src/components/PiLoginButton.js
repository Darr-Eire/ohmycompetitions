// src/components/PiLoginButton.js
'use client';

import { useState } from 'react';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export default function PiLoginButton({ apiBaseUrl = '/api' }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (typeof window.Pi?.authenticate !== 'function') {
        throw new Error(
          'Pi SDK not available. Are you in the Pi Browser or did you include the SDK script?'
        );
      }

      // 1) Call the Pi SDK
      console.log('[PiLoginButton] calling Pi.authenticate()');
      const resp = await window.Pi.authenticate();
      console.log('[PiLoginButton] got resp:', resp);

      // 2) Guard against undefined
      if (!resp) {
        throw new Error('No response object from Pi.authenticate()');
      }

      // 3) Now destructure safely
      const { token, signature, publicAddress } = resp;
      if (!token || !publicAddress) {
        throw new Error(
          `Incomplete auth data: ${JSON.stringify(resp, null, 2)}`
        );
      }

      // 4) Send to your backend
      const res = await fetchWithTimeout(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, signature, publicAddress }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `HTTP ${res.status}`);
      }

      alert('Login successful!');
    } catch (err) {
      console.error('[PiLoginButton] error:', err);
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
