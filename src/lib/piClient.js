// ============================================================================
// PATH: src/lib/piClient.js
// Purpose: Isomorphic Pi client — browser SDK init + server API helpers.
// ============================================================================

import axios from 'axios';

/* --------------------------- Environment & config -------------------------- */
const IS_BROWSER = typeof window !== 'undefined';
const PI_ENV = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'testnet').toLowerCase();

const PI_BASE = (process.env.PI_BASE_URL || process.env.PI_API_BASE || 'https://api.minepi.com').replace(/\/+$/, '');
const BASE_URL = `${PI_BASE}/v2`;

const RESOLVED_API_KEY =
  (PI_ENV === 'testnet'
    ? process.env.PI_API_KEY_TESTNET
    : PI_ENV === 'mainnet'
    ? process.env.PI_API_KEY_MAINNET
    : process.env.PI_API_KEY_SANDBOX) ||
  process.env.PI_API_KEY ||
  process.env.PI_APP_SECRET;

/* ------------------------------ Browser (SDK) ------------------------------ */
function resolvePiNetworkLabel() {
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim();
  if (raw === 'mainnet' || raw === 'pi mainnet') return 'Pi Mainnet';
  if (raw === 'sandbox' || raw === 'pi sandbox') return 'Pi Testnet';
  return 'Pi Testnet';
}

let sdkInited = false;
let sdkReadyPromise = null;

/**
 * Waits for the Pi SDK and initializes it once.
 * Named export for: import { readyPi } from 'lib/piClient'
 */
export function readyPi({ timeoutMs = 7000, network } = {}) {
  if (!IS_BROWSER) throw new Error('Pi SDK is only available in the browser');
  if (sdkReadyPromise) return sdkReadyPromise;

  sdkReadyPromise = new Promise((resolve, reject) => {
    const start = Date.now();
    (function waitForPi() {
      const Pi = window.Pi;
      if (!Pi) {
        if (Date.now() - start > timeoutMs) return reject(new Error('Pi SDK not found (timeout)'));
        return setTimeout(waitForPi, 120);
      }
      try {
        if (!sdkInited) {
          Pi.init({ version: '2.0', network: network || resolvePiNetworkLabel() });
          sdkInited = true;
          console.info('[PiClient] SDK initialized:', { network: network || resolvePiNetworkLabel() });
        }
        if (typeof Pi.createPayment !== 'function') {
          return reject(new Error('Pi SDK incomplete (createPayment missing)'));
        }
        resolve(Pi);
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    })();
  });

  return sdkReadyPromise;
}

/** Non-throwing peek; prefer readyPi() for real flows */
export function getPi() {
  return IS_BROWSER ? window.Pi || null : null;
}

/* ------------------------------- Server (API) ------------------------------ */
function guardServer(label) {
  if (IS_BROWSER) throw new Error(`${label} is server-only and cannot be called in the browser.`);
}

function makeServerClient(accessToken) {
  guardServer('Pi API');
  if (!RESOLVED_API_KEY) {
    throw new Error('Missing Pi API key. Set PI_API_KEY_TESTNET/MAINNET/SANDBOX or PI_APP_SECRET.');
  }

  return axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
      Authorization: `Key ${RESOLVED_API_KEY}`,
      ...(accessToken ? { 'X-PI-ACCESS-TOKEN': accessToken } : {}),
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'OMC-Server/1.1',
    },
  });
}

async function call(fn, label) {
  try {
    const { data } = await fn();
    return data;
  } catch (err) {
    const status = err?.response?.status;
    const body = err?.response?.data ?? err?.message;
    throw new Error(`Pi ${label} failed${status ? ` (${status})` : ''}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }
}

/** Poll until a payment exists on Pi servers (creates→404 race fix) */
export async function pollPaymentUntilFound(paymentId, { accessToken, attempts = 8, delayMs = 1500 } = {}) {
  guardServer('pollPaymentUntilFound');
  const id = encodeURIComponent(paymentId);
  const client = makeServerClient(accessToken);
  let lastErr;

  for (let i = 0; i < attempts; i++) {
    try {
      const { data } = await client.get(`/payments/${id}`);
      return data;
    } catch (err) {
      const status = err?.response?.status;
      lastErr = err;
      if (status === 404) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw new Error(`Pi getPayment failed${status ? ` (${status})` : ''}: ${err?.message || err}`);
    }
  }

  throw new Error('Pi getPayment timed out: payment_not_found');
}

export function getMe(accessToken) {
  guardServer('getMe');
  const c = makeServerClient(accessToken);
  return call(() => c.get('/me'), 'getMe');
}

export function getPayment(paymentId, accessToken) {
  guardServer('getPayment');
  const id = encodeURIComponent(paymentId);
  const c = makeServerClient(accessToken);
  return call(() => c.get(`/payments/${id}`), 'getPayment');
}

export function approvePayment(paymentId, accessToken) {
  guardServer('approvePayment');
  const id = encodeURIComponent(paymentId);
  const c = makeServerClient(accessToken);
  return call(() => c.post(`/payments/${id}/approve`), 'approvePayment');
}

export function completePayment(paymentId, txid, accessToken) {
  guardServer('completePayment');
  const id = encodeURIComponent(paymentId);
  const c = makeServerClient(accessToken);
  return call(() => c.post(`/payments/${id}/complete`, { txid }), 'completePayment');
}

/* ------------------------------ Default export ----------------------------- */
export default {
  // Convenience default export for `import PiClient from 'lib/piClient'`
  readyPi,
  getPi,
  pollPaymentUntilFound,
  getMe,
  getPayment,
  approvePayment,
  completePayment,
};