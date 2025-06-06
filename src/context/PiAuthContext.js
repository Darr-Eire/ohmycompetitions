// src/context/PiAuthContext.jsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const PiAuthContext = createContext();

// Export hook
export function usePiAuth() {
  return useContext(PiAuthContext);
}

// Load Pi SDK helper (returns Promise)
function loadPiSdk() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('Not client side');
    if (window.Pi) return resolve();

    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.onload = () => resolve();
    script.onerror = () => reject('Failed to load Pi SDK');
    document.body.appendChild(script);
  });
}

export function PiAuthProvider({ children }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        await loadPiSdk();
        setSdkReady(true);
        console.log('✅ Pi SDK loaded');

        const storedUser = localStorage.getItem('piUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Login function
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
      alert('Login failed');
    }
  }

  // Logout function
  function logout() {
    setUser(null);
    localStorage.removeItem('piUser');
  }

  // Provide context value
  const value = { user, login, logout, loading };

  // BLOCK rendering until loading finishes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl font-bold">
        Loading authentication...
      </div>
    );
  }

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
}
