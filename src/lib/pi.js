// lib/pi.js

/**
 * Loads the Pi SDK if it's not already loaded.
 * @param {Function} onLoaded - Callback after Pi SDK is initialized.
 */
export const loadPiSdk = (onLoaded) => {
  if (typeof window === 'undefined') return;

  if (window.Pi) {
    window.Pi.init({ version: '2.0' });
    onLoaded();
    return;
  }

  const existingScript = document.querySelector('script[src="https://sdk.minepi.com/pi-sdk.js"]');
  if (existingScript) {
    existingScript.onload = () => {
      window.Pi.init({ version: '2.0' });
      onLoaded();
    };
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;
  script.onload = () => {
    window.Pi.init({ version: '2.0' });
    onLoaded();
  };
  script.onerror = () => console.error('❌ Failed to load Pi SDK.');
  document.body.appendChild(script);
};

/**
 * Initiates a payment session using Pi SDK.
 * @param {Object} options
 * @param {string} options.amount - Amount of Pi to charge
 * @param {string} options.memo - Description/memo
 * @param {Object} options.metadata - Optional metadata for the transaction
 * @param {Function} onReadyForServerApproval - callback with paymentId
 * @param {Function} onReadyForServerCompletion - callback with paymentId and txid
 * @param {Function} onCancel - user cancelled
 * @param {Function} onError - any failure
 */
export function createPiPaymentSession({
  amount,
  memo,
  metadata,
  onReadyForServerApproval,
  onReadyForServerCompletion,
  onCancel,
  onError,
}) {
  if (!window?.Pi?.createPayment) {
    return onError('Pi SDK not loaded or invalid.');
  }

  window.Pi.createPayment({
    amount: amount.toString(),
    memo,
    metadata,
    onReadyForServerApproval,
    onReadyForServerCompletion,
    onCancel,
    onError,
  });
}
