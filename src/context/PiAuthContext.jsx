'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const PiAuthContext = createContext();

// Export custom hook to access context
export function usePiAuth() {
  return useContext(PiAuthContext);
}

// Helper to load Pi SDK
function loadPiSdk(setSdkReady) {
  if (typeof window === 'undefined') return;

  if (window.Pi) {
    setSdkReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.onload = function () {
    setSdkReady(true);
  };
  script.onerror = function () {
    console.error('Failed to load Pi SDK');
  };
  document.body.appendChild(script);
}

// Auth Provider component
export function PiAuthProvider({ children }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(function () {
    const storedUser = localStorage.getItem('piUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Load Pi SDK
  useEffect(function () {
    loadPiSdk(setSdkReady);
  }, []);

  // Login function
  async function login() {
    if (!sdkReady || typeof window === 'undefined' || !window.Pi) {
      alert('Pi SDK not ready. Make sure you are in the Pi Browser.');
      return;
    }

    try {
      const scopes = ['username', 'payments'];
      const result = await window.Pi.authenticate(scopes);
      setUser(result.user);
      localStorage.setItem('piUser', JSON.stringify(result.user));
    } catch (err) {
      console.error('Pi authentication failed', err);
      alert('Login failed.');
    }
  }

  // Logout function (optional)
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
