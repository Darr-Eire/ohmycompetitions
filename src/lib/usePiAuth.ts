'use client';

import { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi'; // assumes this loads and calls Pi.init({ version: '2.0' })

export function usePiAuth() {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load Pi SDK
  useEffect(() => {
    loadPiSdk()
      .then(() => {
        setSdkReady(true);
      })
      .catch((err) => {
        console.error('❌ Failed to load Pi SDK:', err);
      });
  }, []);

  // Load user from localStorage (if any)
  useEffect(() => {
    const stored = localStorage.getItem('piUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        console.warn('⚠️ Invalid piUser in localStorage');
        localStorage.removeItem('piUser');
      }
    }
    setLoading(false);
  }, []);

  // Manual login function
  const login = async () => {
    if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
      alert('Pi SDK not ready. Use Pi Browser.');
      return;
    }

    try {
      const scopes = ['username', 'payments'];
      const result = await window.Pi.authenticate(scopes);

      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: result.accessToken }),
      });

      if (!res.ok) throw new Error('Login API failed');
      const data = await res.json();

      setUser(data.user);
      localStorage.setItem('piUser', JSON.stringify(data.user));
    } catch (error) {
      console.error('❌ Pi login failed:', error);
      alert('Login failed. Check console.');
    }
  };

  // Manual logout function
  const logout = () => {
    localStorage.removeItem('piUser');
    window.Pi?.logout?.();
    setUser(null);
  };

  return { user, sdkReady, loading, login, logout };
}
