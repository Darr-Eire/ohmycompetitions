// lib/pi.js
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
