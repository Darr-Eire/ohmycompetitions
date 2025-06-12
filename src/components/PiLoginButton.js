'use client';

import { useState } from 'react';

export default function PiLoginButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const loginWithPi = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      alert('⚠️ Pi SDK not loaded. Make sure you are inside the Pi Browser.');
      return;
    }

    setLoading(true);

    try {
      const scopes = ['username', 'payments'];

      const onIncompletePaymentFound = (payment) => {
        console.warn('⚠️ Unfinished Pi payment found:', payment);
        // You can handle retry/complete here if needed
      };

      const { accessToken } = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      const verifyRes = await fetch('/api/pi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!verifyRes.ok) throw new Error('❌ Pi login backend verification failed');

      const verifiedUser = await verifyRes.json();
      setUser(verifiedUser);
      console.log('✅ Pi login successful:', verifiedUser);
    } catch (err) {
      console.error('❌ Pi login failed:', err);
      alert('Pi login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={loginWithPi}
      disabled={loading}
      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition"
    >
      {user
        ? `Logged in as ${user.username}`
        : loading
        ? 'Logging in...'
        : 'Login with Pi'}
    </button>
  );
}
