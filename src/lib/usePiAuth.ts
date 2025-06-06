// lib/usePiAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { loadPiSdk } from 'lib/pi'; // your existing SDK loader

export function usePiAuth() {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  useEffect(() => {
    const authenticate = async () => {
      if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
        setLoading(false);
        return;
      }

      try {
        const scopes = ['username', 'payments'];
        const result = await window.Pi.authenticate(scopes);

        // Optionally send user info to your server to create session
        await fetch('/api/auth/pi-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        });

        setUser(result.user);
      } catch (error) {
        console.error('Pi Authentication failed:', error);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [sdkReady]);

  return { user, sdkReady, loading };
}
