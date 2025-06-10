export const loadPiSdk = (onLoaded) => {
  if (typeof window === 'undefined') return; // Guard for SSR

  if (window.Pi) {
    window.Pi.init({ version: '2.0' });
    onLoaded();
    return;
  }

  const existingScript = document.querySelector('script[src="https://sdk.minepi.com/pi-sdk.js"]');
  if (existingScript) {
    existingScript.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: '2.0' });
        onLoaded();
      }
    };
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;
  script.onload = () => {
    if (window.Pi) {
      window.Pi.init({ version: '2.0' });
      onLoaded();
    }
  };
  script.onerror = () => console.error('❌ Failed to load Pi SDK.');
  document.body.appendChild(script);
};
