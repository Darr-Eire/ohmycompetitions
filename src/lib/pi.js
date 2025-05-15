// lib/pi.js

/**
 * Dynamically loads the Pi SDK and initializes it.
 * Calls setReady(true) when the SDK is fully loaded and ready.
 *
 * @param {Function} setReady - React state setter (e.g., setSdkReady)
 */
export function loadPiSdk(setReady) {
  if (typeof window === 'undefined') return; // SSR guard

  // SDK already available
  if (window.Pi && typeof window.Pi.createPayment === 'function') {
    setReady(true);
    return;
  }

  // Inject Pi SDK script
  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;

  script.onload = () => {
    const wait = setInterval(() => {
      if (window.Pi && typeof window.Pi.createPayment === 'function') {
        clearInterval(wait);
        window.Pi.init({ version: '2.0' });
        setReady(true);
        console.log('✅ Pi SDK fully loaded');
      }
    }, 100);
  };

  document.body.appendChild(script);
}
