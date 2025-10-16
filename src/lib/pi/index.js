// src/lib/pi/index.js
import { readyPi } from '../piClient';

// choose network from env; default to Testnet in dev, Mainnet in prod if you prefer
const NETWORK =
  process.env.NEXT_PUBLIC_PI_NETWORK ||
  (process.env.NODE_ENV === 'development' ? 'Pi Testnet' : 'Pi Testnet'); // change to 'Pi Network' when ready

let _piPromise = null;

function waitForPiOnWindow(timeoutMs = 4000, intervalMs = 100) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (typeof window !== 'undefined' && window.Pi) return resolve(window.Pi);
      if (Date.now() - started >= timeoutMs) {
        return reject(new Error('Pi SDK not found on window within timeout'));
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

// Minimal API used by BuyTicketButton or other callers
export async function ensurePi() {
  if (typeof window === 'undefined') {
    throw new Error('Pi SDK must be used in the browser (client-side only)');
  }

  // memoize a single initialization per session
  if (!_piPromise) {
    _piPromise = (async () => {
      // make sure SDK script is actually present
      await waitForPiOnWindow().catch((e) => {
        // Helpful hint in dev
        throw new Error(
          `Pi SDK not available. Ensure the Pi script is loaded before calling ensurePi(). Original: ${e.message}`
        );
      });

      // your provided initializer; let it throw if misconfigured
      const Pi = await readyPi(NETWORK);
      if (!Pi || typeof Pi.authenticate !== 'function') {
        throw new Error('Pi SDK initialized but missing expected methods');
      }
      return Pi;
    })();
  }

  return _piPromise;
}

// Optional helpers mirroring old names
export async function authenticate(scopes = ['payments', 'username', 'roles']) {
  const Pi = await ensurePi();
  return Pi.authenticate(scopes);
}

export async function createPayment(args) {
  const Pi = await ensurePi();
  return Pi.createPayment(args);
}
