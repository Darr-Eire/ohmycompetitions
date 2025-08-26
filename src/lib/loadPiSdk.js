// src/lib/loadPiSdk.js

export function loadPiSdk(setReady) {
  if (typeof window === 'undefined') return;

<<<<<<< Updated upstream
  // Check if Pi SDK is already loaded and initialized
  if (window.Pi && typeof window.Pi.createPayment === 'function') {
    console.log('✅ Pi SDK already loaded and ready');
    setReady(true);
    return;
=======
  console.log('🔧 Loading Pi SDK...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current URL:', window.location.href);

  // Clear any existing Pi SDK
  if (window.Pi) {
    console.log('⚠️ Clearing existing Pi SDK');
    delete window.Pi;
  }

  // Remove existing script
  const existingScript = document.querySelector('script[src*="pi-sdk.js"]');
  if (existingScript) {
    existingScript.remove();
>>>>>>> Stashed changes
  }

  // Wait for Pi SDK to be available (it's loaded in _document.js)
  const checkInterval = setInterval(() => {
    if (window.Pi && typeof window.Pi.createPayment === 'function') {
      clearInterval(checkInterval);
      console.log('✅ Pi SDK ready');
      setReady(true);
    }
  }, 100);

<<<<<<< Updated upstream
  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      console.error('❌ Pi SDK failed to load within 10 seconds');
      setReady(false);
    }
  }, 10000);
=======
  script.onload = () => {
    console.log('✅ Pi SDK script loaded');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    const check = setInterval(() => {
      attempts++;
      
      if (window.Pi && typeof window.Pi.init === 'function') {
        clearInterval(check);
        
        try {
          // Force sandbox mode for development, localhost, or ngrok URLs
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const isDevelopment = process.env.NODE_ENV === 'development';
          const isNgrok = window.location.hostname.includes('ngrok-free.app') || window.location.hostname.includes('ngrok.io');
          const sandbox = isDevelopment || isLocalhost || isNgrok;
          
          const config = { version: '2.0', sandbox };
          console.log('🔧 Initializing Pi SDK with config:', config);
          
          window.Pi.init(config);
          
          // Verify initialization
          setTimeout(() => {
            if (typeof window.Pi.authenticate === 'function') {
              console.log('✅ Pi SDK fully initialized');
              setReady(true);
            } else {
              console.error('❌ Pi SDK initialization incomplete');
              setReady(false);
            }
          }, 500);
          
        } catch (error) {
          console.error('❌ Pi SDK initialization failed:', error);
          setReady(false);
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(check);
        console.error('❌ Pi SDK initialization timeout');
        setReady(false);
      } else {
        console.log(`⏳ Waiting for Pi SDK... (${attempts}/${maxAttempts})`);
      }
    }, 200);
  };

  script.onerror = (error) => {
    console.error('❌ Failed to load Pi SDK script:', error);
    setReady(false);
  };

  document.head.appendChild(script);
>>>>>>> Stashed changes
}

export function createPiPaymentSession(paymentDetails) {
  console.warn('🔧 createPiPaymentSession is not implemented yet:', paymentDetails);
}
