import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { loadPiSdk } from '../lib/loadPiSdk';

const PiAuthContext = createContext();

export function usePiAuth() {
  return useContext(PiAuthContext);
}

export function PiAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    loadPiSdk(setSdkReady);
  }, []);

  const logout = async () => {
    try {
      // Clear user from context
      setUser(null);
      
      // Call logout endpoint to clear session
      await axios.post('/api/auth/logout');
      
      console.log('✅ Logged out successfully');
    } catch (err) {
      console.error('❌ Logout failed:', err.message || err);
    }
  };

  const loginWithPi = async () => {
    if (!sdkReady) {
      console.warn('❌ Pi SDK not ready');
      alert('Please wait a moment while we initialize the Pi Network connection...');
      return;
    }

    if (typeof window.Pi?.authenticate !== 'function') {
      console.error('❌ Pi SDK authentication not available');
      alert('Please make sure you are using the Pi Browser');
      return;
    }

    try {
      const scopes = ['username', 'payments'];

      const onIncompletePaymentFound = async (payment) => {
        console.warn('⚠️ Incomplete Pi payment:', payment);
        try {
          // Attempt to complete the incomplete payment
          const result = await axios.post('/api/pi/incomplete', { 
            payment,
            // For auth-time incomplete payments, we don't have a slug
            // These are likely from previous sessions
            slug: payment.metadata?.competitionSlug || null
          });
          console.log('📝 Handled incomplete payment:', result.data);
        } catch (err) {
          console.error('❌ Failed to handle incomplete payment:', err.message || err);
        }
      };

      console.log('🔄 Starting Pi authentication...');
      const { accessToken, user: piUser } = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      if (!accessToken) {
        throw new Error('Authentication failed - No access token received');
      }

      console.log('✅ Pi authentication successful, verifying with backend...');
      const res = await axios.post('/api/pi/verify', { 
        accessToken,
        userData: piUser
      });

      if (res.status === 200) {
        setUser(res.data);
        console.log('✅ Login verified:', res.data);
      } else {
        throw new Error(`Login verification failed with status ${res.status}`);
      }
    } catch (err) {
      console.error('❌ Pi Login failed:', err.message || err);
      // More descriptive error messages for users
      let errorMessage = 'Authentication failed';
      
      if (err.message?.includes('No access token')) {
        errorMessage = 'Authentication was cancelled or failed. Please try again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please try logging in again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Pi Login failed: ${errorMessage}`);
    }
  };

  return (
    <PiAuthContext.Provider value={{ user, loginWithPi, logout }}>
      {children}
    </PiAuthContext.Provider>
  );
}
