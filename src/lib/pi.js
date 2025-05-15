/**
 * Loads the Pi SDK dynamically in the browser.
 * Calls setReady(true) once the SDK is fully initialized.
 */
export function loadPiSdk(setReady) {
  if (typeof window === 'undefined') return;

  if (window.Pi && typeof window.Pi.createPayment === 'function') {
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
        window.Pi.init({ version: '2.0' });
        setReady(true);
        console.log('✅ Pi SDK loaded');
      }
    }, 100);
  };

  document.body.appendChild(script);
}

// Placeholder payment session creator
export function createPiPaymentSession(paymentDetails) {
  console.log('🔧 createPiPaymentSession not implemented', paymentDetails);
}
