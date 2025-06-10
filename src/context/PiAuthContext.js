import { createContext, useContext, useEffect, useState } from 'react';

const PiAuthContext = createContext();

export const PiAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      setSdkReady(true);
    }
  }, []);

  const login = async () => {
    if (!window.Pi) return console.error('Pi SDK not available');
    
    try {
      const scopes = ['username', 'payments'];
      window.Pi.authenticate(scopes, async function (auth) {
        const res = await fetch('/api/verify-pi-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: auth.accessToken }),
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem('piUser', JSON.stringify(data.user));
        } else {
          console.error(data.error);
        }
      }, function (error) {
        console.error('Pi login failed', error);
      });
    } catch (err) {
      console.error('Login error', err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('piUser');
  };

  useEffect(() => {
    const stored = localStorage.getItem('piUser');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <PiAuthContext.Provider value={{ user, sdkReady, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = () => useContext(PiAuthContext);
