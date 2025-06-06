// lib/pi.ts
export function loadPiSdk(setReady: (ready: boolean) => void) {
  if (typeof window === 'undefined') return;

  if (window.Pi) {
    setReady(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.minepi.com/pi-sdk.js';
  script.onload = () => setReady(true);
  script.onerror = () => console.error('Failed to load Pi SDK');
  document.body.appendChild(script);
}
