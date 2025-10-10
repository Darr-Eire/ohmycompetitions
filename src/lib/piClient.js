// src/lib/piClient.js
// Isomorphic Pi client: browser SDK init + server Pi API helpers.

import axios from 'axios';

/* --------------------------- Environment & config -------------------------- */
const IS_BROWSER = typeof window !== 'undefined';

// App-level env (used on server) – default to testnet unless you really want sandbox.
const PI_ENV = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'testnet').toLowerCase();

// Pi Platform base
const PI_BASE = (process.env.PI_BASE_URL || process.env.PI_API_BASE || 'https://api.minepi.com').replace(/\/+$/, '');
const BASE_URL = `${PI_BASE}/v2`;

// Prefer explicit per-env keys; fall back to legacy single key
const RESOLVED_API_KEY =
  (PI_ENV === 'testnet'
    ? process.env.PI_API_KEY_TESTNET
    : PI_ENV === 'mainnet'
    ? process.env.PI_API_KEY_MAINNET
    : process.env.PI_API_KEY_SANDBOX) ||
  process.env.PI_API_KEY ||
  process.env.PI_APP_SECRET;

/* ------------------------------ Browser (SDK) ------------------------------ */
// Map env → exact labels the SDK expects
function resolvePiNetworkLabel() {
  const raw = (process.env.NEXT_PUBLIC_PI_ENV || process.env.PI_ENV || '').toLowerCase().trim();
  if (raw === 'mainnet' || raw === 'pi mainnet') return 'Pi Mainnet';
  if (raw === 'sandbox' || raw === 'pi sandbox') return 'Pi Testnet'; // prefer testnet in practice
  return 'Pi Testnet';
}

let sdkInited = false;
let sdkReadyPromise = null;

/**
 * readyPi(): awaits window.Pi, initializes once with the correct network label, returns Pi.
 * Throws outside the browser or if the SDK script isn't present.
 */
export function readyPi({ timeoutMs = 7000, network } = {}) {
  if (!IS_BROWSER) throw new Error('Pi SDK is only available in the browser');
  if (sdkReadyPromise) return sdkReadyPromise;

  sdkReadyPromise = new Promise((resolve, reject) => {
    const start = Date.now();
    (function waitForPi() {
      const Pi = window.Pi;
      if (!Pi) {
        if (Date.now() - start > timeoutMs) return reject(new Error('Pi SDK not found'));
        return setTimeout(waitForPi, 120);
      }
      try {
        if (!sdkInited) {
          Pi.init({ version: '2.0', network: network || resolvePiNetworkLabel() });
          sdkInited = true;
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

/**
 * getPi(): non-throwing peek at window.Pi (no init). Prefer readyPi() for real flows.
 */
export function getPi() {
  return IS_BROWSER ? window.Pi || null : null;
}

/* ------------------------------- Server (API) ------------------------------ */
function guardServer(label) {
  if (IS_BROWSER) throw new Error(`${label} is server-only and cannot be called in the browser bundle.`);
}

function makeServerClient(accessToken) {
  guardServer('Pi API');
  if (!RESOLVED_API_KEY) {
    throw new Error('Missing Pi API key. Set PI_API_KEY_TESTNET/MAINNET/SANDBOX or PI_API_KEY/PI_APP_SECRET.');
  }
  return axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
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
    throw new Error(
      `Pi ${label} failed${status ? ` (${status})` : ''}: ${
        typeof body === 'string' ? body : JSON.stringify(body)
      }`
    );
  }
}

// Poll until payment is visible (fixes create → 404 race)
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
      const s = err?.response?.status;
      const body = err?.response?.data?.error || err.message;
      throw new Error(`Pi getPayment failed${s ? ` (${s})` : ''}: ${body}`);
    }
  }
  const s = lastErr?.response?.status;
  throw new Error(`Pi getPayment timed out${s ? ` (${s})` : ''}: payment_not_found`);
}

export function getMe(accessToken) {
  guardServer('getMe');
  if (!accessToken) throw new Error('getMe requires accessToken');
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
const client = {
  // browser
  readyPi,
  getPi,
  // server
  pollPaymentUntilFound,
  getMe,
  getPayment,
  approvePayment,
  completePayment,
};

export default client;
