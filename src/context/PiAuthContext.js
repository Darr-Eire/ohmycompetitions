import { createContext, useContext, useState, useEffect } from 'react';

const PiAuthContext = createContext();

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

 useEffect(() => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: '2.0' });
        console.log('✅ Pi SDK initialized');
      } else {
        console.warn('❌ Pi SDK not available');
      }
    };
    document.body.appendChild(script);
  }
}, []);


  const loginWithPi = async () => {
    if (!sdkReady || !window.Pi?.authenticate) {
      alert('Pi SDK not ready yet.');
      return;
    }

    try {
      const { accessToken } = await window.Pi.authenticate(['username', 'payments']);

      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();
      if (res.ok) setUser(data.user);
      else throw new Error(data.error);
    } catch (err) {
      console.error('Pi login failed:', err);
      alert('Login failed');
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
