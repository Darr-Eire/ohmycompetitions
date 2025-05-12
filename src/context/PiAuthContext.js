import { createContext, useContext, useState, useEffect } from 'react';

const PiAuthContext = createContext();

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginWithPi = async () => {
    try {
      if (!window?.Pi) {
        alert('Pi SDK not loaded. Please use the Pi Browser.');
        return;
      }

      const userData = await window.Pi.authenticate(['username', 'payments']);
      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: userData.accessToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUser(data.user);
    } catch (err) {
      console.error('❌ Pi login failed:', err);
      alert('Login failed. Please try again.');
    }
  };

  const logout = () => setUser(null);

  return (
    <PiAuthContext.Provider value={{ user, loginWithPi, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  return useContext(PiAuthContext);
}
