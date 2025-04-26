// src/components/PiLoginButton.js
'use client';

import { useState } from 'react';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export default function PiLoginButton({ apiBaseUrl = '/api' }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // 1) Acquire the Pi auth data first
      const { token, signature, publicAddress } = await window.Pi?.authenticate?.();
      if (!token || !publicAddress) {
        throw new Error('Failed to acquire Pi auth data');
      }

      // 2) Then send it to your API
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
