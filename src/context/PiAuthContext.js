// src/context/PiAuthContext.js
import { createContext, useContext, useState } from 'react';

const PiAuthContext = createContext();

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null); // for UI debug

  const loginWithPi = async () => {
    try {
      const { accessToken } = await window.Pi.authenticate(['username', 'payments']);

      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Pi login failed on server');
      }

      setUser(data.user);
      setError(null);
    } catch (err) {
      console.error('Pi login failed:', err);
      setError(err.message || 'Pi login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <PiAuthContext.Provider value={{ user, loginWithPi, logout, error }}>
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  return useContext(PiAuthContext);
}
