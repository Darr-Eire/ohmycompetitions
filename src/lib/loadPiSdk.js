// src/lib/loadPiSdk.js

export function loadPiSdk(setReady) {
  if (typeof window === 'undefined') return;

  // Check if Pi SDK is already loaded and initialized
  if (window.Pi && typeof window.Pi.createPayment === 'function') {
    console.log('✅ Pi SDK already loaded and ready');
    setReady(true);
    return;
  }

  // Wait for Pi SDK to be available (it's loaded in _document.js)
  const checkInterval = setInterval(() => {
    if (window.Pi && typeof window.Pi.createPayment === 'function') {
      clearInterval(checkInterval);
      console.log('✅ Pi SDK ready');
      setReady(true);
    }
  }, 100);

  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      console.error('❌ Pi SDK failed to load within 10 seconds');
      setReady(false);
    }
  }, 10000);
}

export function createPiPaymentSession(paymentDetails) {
  console.warn('🔧 createPiPaymentSession is not implemented yet:', paymentDetails);
}
