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
    if (!window?.Pi) {
      console.error('❌ Pi SDK not available');
      return reject('Pi SDK not loaded');
    }

    window.Pi.authenticate(['username', 'payments'], async function (auth) {
      console.log('AUTH CALLBACK:', auth); // ← important
      if (auth.accessToken) {
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
          console.error('❌ Backend rejected Pi login:', data.error);
          reject(data.error);
        }
      } else {
        console.error('❌ No access token from Pi login');
        reject('Missing access token');
      }
    }, function (error) {
      console.error('❌ Pi login error callback:', error);
      reject(error.message || 'Cancelled');
    });
  });
};


  return (
    <PiAuthContext.Provider value={{ user, sdkReady, login, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = () => useContext(PiAuthContext);
