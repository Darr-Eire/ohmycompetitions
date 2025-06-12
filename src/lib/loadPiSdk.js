// src/lib/loadPiSdk.js

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

        const sandbox = window._ENV?.sandbox === 'true';
        window.Pi.init({ version: '2.0', sandbox });

        setReady(true);
        console.log('✅ Pi SDK loaded');
      }
    }, 100);
  };

  document.body.appendChild(script);
}

export function createPiPaymentSession(paymentDetails) {
  console.warn('🔧 createPiPaymentSession is not implemented yet:', paymentDetails);
}
