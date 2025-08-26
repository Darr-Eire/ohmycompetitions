// src/lib/loadPiSdk.js
let loadingPromise = null;

 fix/pi-sdk-loader
export async function loadPiSdk() {
  if (typeof window === "undefined") return null;

  // Already loaded → return immediately
  if (window.Pi) return window.Pi;
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js"; // Official CDN
    script.async = true;

    script.onload = () => {
      if (window.Pi) {
        console.log("✅ Pi SDK loaded successfully from CDN");
        resolve(window.Pi);

/**
 * Dynamically loads and initializes the Pi Network SDK.
 * Ensures proper sandbox vs production handling based on environment.
 *
 * @param {Function} setReady - State setter to indicate when the SDK is ready.
 */
export function loadPiSdk(setReady) {
  if (typeof window === 'undefined') return;

  // Check if Pi SDK is already loaded and initialized
  if (window.Pi && typeof window.Pi.createPayment === 'function') {
    console.log('✅ Pi SDK already loaded and ready');
    setReady(true);
    return;
  }
  console.log('🔧 Loading Pi SDK...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current URL:', window.location.href);

  // Clear any existing Pi SDK to avoid duplicates
  if (window.Pi) {
    console.log('⚠️ Clearing existing Pi SDK');
    delete window.Pi;
  }

  // Remove any existing Pi SDK script
  const existingScript = document.querySelector('script[src*="pi-sdk.js"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create a new Pi SDK script
  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;

  // Handle script load success
  script.onload = () => {
    console.log('✅ Pi SDK script loaded');

    let attempts = 0;
    const maxAttempts = 30;

    const check = setInterval(() => {
      attempts++;

      // Wait until Pi SDK is fully available
      if (window.Pi && typeof window.Pi.init === 'function') {
        clearInterval(check);

        try {
          // Detect sandbox environment (localhost, dev, ngrok)
          const isLocalhost =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';
          const isDevelopment = process.env.NODE_ENV === 'development';
          const isNgrok =
            window.location.hostname.includes('ngrok-free.app') ||
            window.location.hostname.includes('ngrok.io');

          const sandbox = isDevelopment || isLocalhost || isNgrok;
          const config = { version: '2.0', sandbox };

          console.log('🔧 Initializing Pi SDK with config:', config);

          // Initialize the Pi SDK
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
 main
      } else {
        reject(new Error("❌ Pi SDK script loaded but Pi object missing"));
      }
    };

fix/pi-sdk-loader
    script.onerror = () => {
      reject(new Error("❌ Failed to load Pi SDK script"));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;

  // Handle script load failure
  script.onerror = (error) => {
    console.error('❌ Failed to load Pi SDK script:', error);
    setReady(false);
  };

  // Inject the Pi SDK script into the document head
  document.head.appendChild(script);

  // Fallback timeout to avoid infinite waits
  const fallbackTimeout = setTimeout(() => {
    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      console.error('❌ Pi SDK failed to load within 10 seconds');
      setReady(false);
    }
    clearTimeout(fallbackTimeout);
  }, 10000);
}

/**
 * Placeholder for starting a Pi payment session.
 * TODO: Implement Pi.createPayment integration.
 */
export function createPiPaymentSession(paymentDetails) {
  console.warn(
    '🔧 createPiPaymentSession is not implemented yet:',
    paymentDetails
  );
 main
}
