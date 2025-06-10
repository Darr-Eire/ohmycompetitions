import { createContext, useContext, useEffect, useState } from 'react';

const PiAuthContext = createContext();

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const check = setInterval(() => {
        if (window.Pi) {
          clearInterval(check);
          setSdkReady(true);

          const storedUser = localStorage.getItem('piUser');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      }, 300);
      return () => clearInterval(check);
    }
  }, []);

  const login = async () => {
    try {
      const scopes = ['username', 'payments'];
      const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      if (auth?.user) {
        setUser(auth.user);
        localStorage.setItem('piUser', JSON.stringify(auth.user));
        console.log('✅ Pi user logged in:', auth.user);
      } else {
        console.warn('❌ No user returned from Pi SDK');
      }
    } catch (err) {
      console.error('❌ Pi authentication failed:', err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('piUser');
  };

  const onIncompletePaymentFound = (payment) => {
    console.log('⚠️ Incomplete payment found:', payment);
  };

  return (
    <PiAuthContext.Provider value={{ user, login, logout, sdkReady }}>
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  return useContext(PiAuthContext);
}
