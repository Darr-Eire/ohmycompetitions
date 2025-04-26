// src/components/PiLoginButton.js
'use client';

import { useState } from 'react';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export default function PiLoginButton({ apiBaseUrl = '/api' }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetchWithTimeout(`${apiBaseUrl}/pi/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }, 10000);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `HTTP ${res.status}`);
      }

      const body = await res.json();
      if (body.error) {
        throw new Error(
          typeof body.error.message === 'string'
            ? body.error.message
            : 'Unknown server error'
        );
      }

      window.location.href = body.redirectUrl;
    } catch (err) {
      console.error('[PiLoginButton]', err);
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button disabled={loading} onClick={handleLogin}>
      {loading ? 'Loading…' : 'Login with Pi'}
    </button>
  );
}
