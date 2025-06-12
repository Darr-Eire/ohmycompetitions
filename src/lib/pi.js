// Load and initialize the Pi SDK
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

// Placeholder for starting a Pi payment session
export function createPiPaymentSession(paymentDetails) {
  console.warn('🔧 createPiPaymentSession is not implemented yet:', paymentDetails);

  // Example placeholder logic
  /*
  window.Pi.createPayment(paymentDetails, {
    onReadyForServerApproval(paymentId) {
      // Send to backend for approval
    },
    onReadyForServerCompletion(paymentId, txid) {
      // Send to backend for completion
    },
    onCancel(paymentId) {
      console.log('❌ Payment cancelled:', paymentId);
    },
    onError(error, paymentId) {
      console.error('❌ Payment error:', error, paymentId);
    }
  });
  */
}
