import { createContext, useContext, useEffect, useState } from 'react';

const PiAuthContext = createContext();

export const PiAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Pi) {
      console.log('✅ Pi SDK loaded');
      setSdkReady(true);
    } else {
      console.warn('❌ Pi SDK not available on window');
    }
  }, []);

  const login = async () => {
    if (!window.Pi) {
      console.error('❌ window.Pi is undefined');
      return;
    }

    console.log('🟡 Attempting Pi login');

    try {
      const scopes = ['username', 'payments'];
      const result = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      console.log('✅ Pi Auth Result:', result);
      localStorage.setItem('piUser', JSON.stringify(result.user));
      setUser(result.user);
    } catch (err) {
      console.error('❌ Pi login failed:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('piUser');
    setUser(null);
  };

  const onIncompletePaymentFound = (payment) => {
    console.log('⚠️ Incomplete payment found:', payment);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('piUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <PiAuthContext.Provider value={{ user, login, logout, sdkReady }}>
      {children}
    </PiAuthContext.Provider>
  );
};

export const usePiAuth = () => useContext(PiAuthContext);
