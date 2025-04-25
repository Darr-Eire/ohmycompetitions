'use client';

import { useEffect, useState } from 'react';

export default function PiLoginButton() {
  const [pi, setPi] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      setPi(window.Pi);
      fetch('/api/sessions').then(res => res.json()).then(data => setUser(data.user));
    }
  }, []);

  const handleLogin = async () => {
    try {
      const result = await pi.requestLogin({
        app_id: process.env.NEXT_PUBLIC_PI_APP_ID,
        scope: ['username'],
      });
      // result.auth_code may differ based on Pi SDK docs
      const authCode = result.auth_code || result.code;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  if (!pi) return null;

  return user ? (
    <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
      Logout {user.username}
    </button>
  ) : (
    <button onClick={handleLogin} className="px-4 py-2 bg-blue-500 text-white rounded">
      Login with Pi
    </button>
  );
}
