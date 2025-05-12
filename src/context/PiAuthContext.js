import { createContext, useContext, useState } from 'react';

const PiAuthContext = createContext();

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginWithPi = async () => {
    try {
      const { accessToken } = await window.Pi.authenticate(['username', 'payments']);
      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        throw new Error(data.error || 'Unknown login error');
      }
    } catch (err) {
      console.error('Pi login failed:', err);
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
