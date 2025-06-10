import { createContext, useContext, useEffect, useState } from 'react';

const PiAuthContext = createContext();

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const checkPiSDK = setInterval(() => {
      if (window.Pi) {
        clearInterval(checkPiSDK);
        setSdkReady(true);

        const storedUser = localStorage.getItem('piUser');
        if (storedUser) setUser(JSON.parse(storedUser));
      }
    }, 200);
    return () => clearInterval(checkPiSDK);
  }, []);

  const login = async () => {
    if (!window.Pi) return alert('Pi SDK not ready');

    try {
      const scopes = ['username', 'payments'];
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      setUser(authResult.user);
      localStorage.setItem('piUser', JSON.stringify(authResult.user));
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('piUser');
    setUser(null);
  };

  const onIncompletePaymentFound = (payment) => {
    console.warn('Found incomplete payment:', payment);
    // Optional: auto resume/cancel
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
