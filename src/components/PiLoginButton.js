// src/components/PiLoginButton.js
'use client';

import { useState } from 'react';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, signature, publicAddress }),
      }, 10000);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (body.error) throw new Error(body.error);

      // success—redirect or update UI
    } catch (err) {
      console.error('Login failed:', err);
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Loading…' : 'Login with Pi'}
    </button>
  );
}
