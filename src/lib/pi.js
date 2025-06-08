export function loadPiSdk(setSdkReady) {
  if (window.Pi) {
    window.Pi.init({ version: '2.0', sandbox: process.env.NODE_ENV !== 'production' });
    setSdkReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;

  script.onload = () => {
    window.Pi.init({ version: '2.0', sandbox: process.env.NODE_ENV !== 'production' });
    setSdkReady(true);
  };

  script.onerror = () => {
    console.error('Failed to load Pi SDK');
    setSdkReady(false);
  };

  document.body.appendChild(script);
}
