import { createContext, useContext, useEffect, useState } from 'react';

const PiAuthContext = createContext();

export const PiAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Load Pi SDK
useEffect(() => {
  if (typeof window === 'undefined') return;

  if (!window.Pi) {
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.onload = () => {
      window.Pi.init({ version: '2.0' });
      setSdkReady(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Pi SDK');
    };
    document.body.appendChild(script);
  } else {
    setSdkReady(true);
  }
}, []);


  const login = () => {
    return new Promise((resolve, reject) => {
      if (!window.Pi) {
        console.error('❌ Pi SDK not available');
        return reject('Pi SDK not loaded');
      }

      const scopes = ['username', 'payments'];
      window.Pi.authenticate(
        scopes,
        async (auth) => {
          try {
            const res = await fetch('/api/pi/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken: auth.accessToken }),
            });

            const data = await res.json();
            if (res.ok) {
              setUser(data);
              localStorage.setItem('piUser', JSON.stringify(data));
              resolve(data);
            } else {
              console.error('❌ Verify failed:', data.error);
              reject(data.error);
            }
          } catch (err) {
            console.error('❌ Server error during verify:', err);
            reject(err.message || 'Server error');
          }
        },
        (error) => {
          console.error('❌ Pi login failed:', error);
          reject(error.message || 'Cancelled');
        }
      );
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('piUser');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('piUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('❌ Failed to parse stored user:', err);
      }
    }
  }, []);

  return (
    <PiAuthContext.Provider value={{ user, sdkReady, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = () => useContext(PiAuthContext);
