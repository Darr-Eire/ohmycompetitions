let sdkLoaded = false;

export function loadPiSdk(setSdkReady) {
  if (sdkLoaded) {
    setSdkReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.async = true;

  script.onload = () => {
    sdkLoaded = true;
    setSdkReady(true);
  };

  script.onerror = () => {
    console.error('Failed to load Pi SDK');
    setSdkReady(false);
  };

  document.body.appendChild(script);
}
