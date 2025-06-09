// lib/pi.js
export const loadPiSdk = (onReady) => {
  if (typeof window === 'undefined') return;

  if (window.Pi) {
    window.Pi.init({ version: '2.0' });
    onReady?.();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;
  script.onload = () => {
    window.Pi.init({ version: '2.0' });
    onReady?.();
  };
  document.body.appendChild(script);
};
