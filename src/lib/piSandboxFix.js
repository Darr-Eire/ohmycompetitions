// Enhanced Pi SDK initialization for sandbox testing
export function loadPiSdkWithSandboxFix(setReady) {
  if (typeof window === 'undefined') return;

  // Log current environment
  console.log('🔧 Initializing Pi SDK with sandbox fix...');
  console.log('Current URL:', window.location.href);
  console.log('Current origin:', window.location.origin);

  // Clear any existing Pi SDK
  if (window.Pi) {
    try {
      delete window.Pi;
    } catch (e) {
      console.warn('Could not clear existing Pi SDK');
    }
  }

  // Remove existing script
  const existingScript = document.querySelector('script[src*="pi-sdk.js"]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;

  script.onload = () => {
    console.log('✅ Pi SDK script loaded');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    const initCheck = setInterval(() => {
      attempts++;
      
      if (window.Pi && typeof window.Pi.init === 'function') {
        clearInterval(initCheck);
        
        try {
          // Force sandbox mode
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const sandboxConfig = {
            version: "2.0",
            sandbox: true
          };

          console.log('🔧 Initializing Pi SDK with config:', sandboxConfig);
          console.log('🏠 Is localhost:', isLocalhost);
          
          window.Pi.init(sandboxConfig);
          
          // Add a small delay to ensure initialization
          setTimeout(() => {
            if (typeof window.Pi.authenticate === 'function') {
              console.log('✅ Pi SDK fully initialized and ready');
              setReady(true);
            } else {
              console.error('❌ Pi SDK init incomplete - authenticate not available');
              setReady(false);
            }
          }, 500);
          
        } catch (err) {
          console.error('❌ Pi SDK initialization error:', err);
          console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name
          });
          setReady(false);
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(initCheck);
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
}

// Enhanced Pi authentication with better error handling
export async function authenticateWithPi(scopes = ['username', 'payments']) {
  if (!window.Pi || typeof window.Pi.authenticate !== 'function') {
    throw new Error('Pi SDK not ready. Please ensure you are using Pi Browser or testing environment.');
  }

  console.log('🔐 Starting Pi authentication...');
  console.log('Requested scopes:', scopes);
  console.log('Current origin:', window.location.origin);

  const onIncompletePaymentFound = (payment) => {
    console.warn('⚠️ Incomplete payment detected:', payment);
    return payment;
  };

  try {
    const result = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
    
    console.log('✅ Pi authentication successful');
    console.log('User:', result.user?.username);
    console.log('Token length:', result.accessToken?.length);
    
    return result;
    
  } catch (error) {
    console.error('❌ Pi authentication failed:', error);
    
    // Enhanced error messages for common issues
    if (error.message?.includes('postMessage')) {
      throw new Error('Origin mismatch error. Please ensure your Pi app is configured for the correct domain.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Authentication timeout. Please try again or check your connection.');
    } else if (error.message?.includes('cancelled')) {
      throw new Error('Authentication was cancelled by user.');
    } else {
      throw new Error(`Authentication failed: ${error.message || 'Unknown error'}`);
    }
  }
}

// Test function to validate Pi SDK setup
export function testPiSdkSetup() {
  console.log('🧪 Testing Pi SDK setup...');
  
  const results = {
    sdkLoaded: !!window.Pi,
    initFunction: !!(window.Pi && typeof window.Pi.init === 'function'),
    authenticateFunction: !!(window.Pi && typeof window.Pi.authenticate === 'function'),
    createPaymentFunction: !!(window.Pi && typeof window.Pi.createPayment === 'function'),
    currentOrigin: window.location.origin,
    userAgent: navigator.userAgent,
    isPiBrowser: navigator.userAgent.includes('PiBrowser')
  };
  
  console.log('📊 Pi SDK Test Results:', results);
  return results;
} 