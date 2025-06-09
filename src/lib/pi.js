export const loadPiSdk = (onReady) => {
  if (typeof window === 'undefined') return;

  if (window.Pi) {
    window.Pi.init({ version: '2.0' });
    onReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;
  script.onload = () => {
    if (window.Pi) {
      window.Pi.init({ version: '2.0' });
      onReady(true);
    }
  };
  document.body.appendChild(script);
};
