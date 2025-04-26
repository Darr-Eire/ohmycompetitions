'use client';

import { useState } from 'react';

export default function PiLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { Pi } = await import('@pinetwork-js/sdk');
      if (!window.__PiInitialized) {
        Pi.init({
          version: '2.0',
          sandbox: true,
          appId: process.env.NEXT_PUBLIC_PI_APP_ID,
          sandboxHost: process.env.NEXT_PUBLIC_PI_SANDBOX_URL,
        });
        window.__PiInitialized = true;
      }

      console.log('Starting Pi authentication');
      const auth = await Pi.authenticate(['payments'], () => {});
      console.log('Pi auth response:', auth);

      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auth),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }

      console.log('API login successful');
      window.location.reload();
    } catch (error) {
      console.error('Pi login failed:', error);
      alert(`Login failed: ${error.message}`);
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
