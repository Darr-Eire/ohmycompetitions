export const loadPiSdk = (onLoaded) => {
  if (window.Pi) {
    window.Pi.init({ version: '2.0' });
    onLoaded();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;
  script.onload = () => {
    window.Pi.init({ version: '2.0' });
    onLoaded();
  };
  document.body.appendChild(script);
};
