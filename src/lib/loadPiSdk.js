// src/lib/loadPiSdk.js

export function loadPiSdk(setReady) {
  if (typeof window === 'undefined') return;

  if (window.Pi && typeof window.Pi.createPayment === 'function') {
    // Initialize even if already loaded
    const sandbox = process.env.NODE_ENV === 'development';
    window.Pi.init({ version: '2.0', sandbox });
    setReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;

  script.onload = () => {
    const check = setInterval(() => {
      if (window.Pi && typeof window.Pi.createPayment === 'function') {
        clearInterval(check);

            // Use PI_SANDBOX environment variable to determine sandbox mode
    const sandbox = process.env.NEXT_PUBLIC_PI_SANDBOX === 'true';
    window.Pi.init({ version: '2.0', sandbox });

        setReady(true);
        console.log('✅ Pi SDK loaded and initialized in', sandbox ? 'sandbox' : 'production', 'mode');
      }
    }, 100);
  };

  script.onerror = (error) => {
    console.error('❌ Failed to load Pi SDK:', error);
    setReady(false);
  };

  document.body.appendChild(script);
}

export function createPiPaymentSession(paymentDetails) {
  console.warn('🔧 createPiPaymentSession is not implemented yet:', paymentDetails);
}
