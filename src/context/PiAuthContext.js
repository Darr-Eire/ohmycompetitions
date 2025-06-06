'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

function loadPiSdk(setSdkReady) {
  if (typeof window === 'undefined') return;
  if (window.Pi) {
    setSdkReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.onload = () => setSdkReady(true);
  script.onerror = () => console.error('Failed to load Pi SDK');
  document.body.appendChild(script);
}

export function PiAuthProvider({ children }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('piUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  async function login() {
    if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
      alert('Pi SDK not ready.');
      return;
    }
    try {
      const result = await window.Pi.authenticate(['username', 'payments']);
      setUser(result.user);
      localStorage.setItem('piUser', JSON.stringify(result.user));
    } catch (err) {
      console.error('Pi authentication failed', err);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('piUser');
  }

  const value = { user, login, logout, loading };

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
}
