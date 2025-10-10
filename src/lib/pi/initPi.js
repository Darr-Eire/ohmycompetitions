// src/lib/pi/initPi.js
export function safeInitPi() {
  if (typeof window === 'undefined') return null;

  const isPiBrowser =
    /PiBrowser/i.test(navigator.userAgent) ||
    document.referrer.includes('minepi.com') ||
    window.name === 'pi_browser';

  if (!isPiBrowser || !window.Pi) return null;

  try {
    window.Pi.init({
      version: '2.0',
      sandbox: false, // TESTNET => false
    });
    return window.Pi;
  } catch (e) {
    console.warn('[Pi] init failed', e);
    return null;
  }
}
