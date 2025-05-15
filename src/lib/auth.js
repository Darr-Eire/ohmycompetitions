// lib/pi.js

/**
 * Loads the Pi SDK dynamically in the browser.
 * Calls setReady(true) once the SDK is fully initialized.
 *
 * @param {Function} setReady - A React setState function (e.g., setSdkReady)
 */
export function loadPiSdk(setReady) {
  if (typeof window === 'undefined') return; // SSR guard

  // If already loaded
  if (window.Pi && typeof window.Pi.createPayment === 'function') {
    setReady(true);
    return;
  }

  // Inject the SDK script
  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;

  script.onload = () => {
    const checkInterval = setInterval(() => {
      if (window.Pi && typeof window.Pi.createPayment === 'function') {
        clearInterval(checkInterval);
        window.Pi.init({ version: '2.0' });
        setReady(true);
        console.log('✅ Pi SDK fully loaded');
      }
    }, 100);
  };

  document.body.appendChild(script);
}
