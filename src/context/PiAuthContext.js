// src/context/PiAuthContext.jsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

// Load Pi SDK helper (returns Promise)
async function loadPiSdk() {
  if (typeof window === 'undefined') throw new Error('Not client side');
  if (window.Pi) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pi SDK'));
    document.body.appendChild(script);
  });
}

export function PiAuthProvider({ children }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = 'piUser';

  useEffect(() => {
    async function init() {
      try {
        await loadPiSdk();
        setSdkReady(true);
        console.log('✅ Pi SDK loaded successfully.');

        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('[❌] SDK load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function login() {
    if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
      alert('⚠️ Pi SDK not ready. Use Pi Browser.');
      return;
    }

    try {
      const result = await window.Pi.authenticate(['username', 'payments']);
      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
      console.log('✅ User logged in:', result.user);
    } catch (err) {
      console.error('❌ Pi authentication failed:', err);
      alert('Login failed. Please try again.');
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = { user, login, logout, loading };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl font-bold">
        Connecting to Pi...
      </div>
    );
  }

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
}
