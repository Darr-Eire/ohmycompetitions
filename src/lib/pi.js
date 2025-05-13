// lib/pi.js
export async function loadPiSdk(setReadyCallback) {
  if (typeof window === 'undefined' || window.Pi) return;

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;
  script.onload = () => {
    const waitForPi = setInterval(() => {
      if (window.Pi) {
        clearInterval(waitForPi);
        window.Pi.init({ version: '2.0' });
        setReadyCallback(true);
        console.log('✅ Pi SDK loaded');
      }
    }, 100);
  };
  document.body.appendChild(script);
}
