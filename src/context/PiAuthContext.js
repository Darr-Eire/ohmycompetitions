'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Optional: Load from localStorage if you want persistent login
    const saved = localStorage.getItem('piUser');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const login = async () => {
    if (!window.Pi) throw new Error('Pi SDK not loaded');

    const scopes = ['username', 'payments'];
    const authResult = await window.Pi.authenticate(scopes, () => {});
    setUser(authResult.user);
    localStorage.setItem('piUser', JSON.stringify(authResult.user));
    return authResult.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('piUser');
  };

  return (
    <PiAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
}
