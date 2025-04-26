'use client';

import { useState } from 'react';

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Dynamically load the browser-only SDK
      const { Pi } = await import('@pinetwork-js/sdk');
      // Initialize once
      if (!window.__PiInitialized) {
        Pi.init({ version: '2.0' });
        window.__PiInitialized = true;
      }
      // Kick off Pi Browser auth
      const auth = await Pi.authenticate(['payments'], () => {});
      
      // Send it to your backend
      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auth),
      });
      if (!res.ok) throw new Error('Login API failed');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
    >
      {loading ? 'Connecting...' : 'Login with Pi'}
    </button>
  );
}
