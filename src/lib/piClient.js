// src/lib/piClient.js
import axios from 'axios';

/* ------------------------------ Env + Config ------------------------------ */
const PI_ENV = (process.env.PI_ENV || 'sandbox').toLowerCase(); // 'sandbox' | 'production'
const PI_API_KEY = process.env.PI_API_KEY; // REQUIRED (sandbox or prod)
const PI_API_BASE =
  process.env.PI_API_BASE || 'https://api.minepi.com/v2'; // keep default

if (!PI_API_KEY) {
  throw new Error('❌ PI_API_KEY missing. Add it to .env.local or server env.');
}

const DEFAULT_TIMEOUT_MS = Number(process.env.PI_API_TIMEOUT_MS || 4500);
const USER_AGENT = `OMC-PiClient/1.0 (${PI_ENV})`;

/* ------------------------------- HTTP Client ------------------------------ */
const client = axios.create({
  baseURL: PI_API_BASE,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Authorization: `Key ${PI_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
  },
  // Avoid throwing on non-2xx so we can inspect response codes when needed
  validateStatus: (s) => s >= 200 && s < 300,
});

/* --------------------------------- Utils --------------------------------- */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry(fn, { attempts = 3, baseDelay = 250 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;
      const retriable = status === 429 || (status >= 500 && status < 600) || !status;
      if (!retriable || i === attempts - 1) break;
      const delay = baseDelay * Math.pow(2, i); // 250, 500, 1000...
      await sleep(delay);
    }
  }
  throw lastErr;
}

function assertPaymentId(id) {
  if (!id || typeof id !== 'string' || id.length < 8) {
    throw new Error('Invalid paymentId');
  }
}

/* --------------------------------- API ----------------------------------- */
export async function getPayment(paymentId) {
  assertPaymentId(paymentId);
  return withRetry(async () => {
    const { data } = await client.get(`/payments/${encodeURIComponent(paymentId)}`);
    return data;
  });
}

export async function approvePayment(paymentId) {
  assertPaymentId(paymentId);
  return withRetry(async () => {
    const { data } = await client.post(`/payments/${encodeURIComponent(paymentId)}/approve`, {});
    return data;
  });
}

/**
 * Complete a payment.
 * @param {string} paymentId
 * @param {string|null} txid - Optional. Some flows include a blockchain tx id.
 */
export async function completePayment(paymentId, txid = null) {
  assertPaymentId(paymentId);
  const body = txid ? { txid } : {};
  return withRetry(async () => {
    const { data } = await client.post(
      `/payments/${encodeURIComponent(paymentId)}/complete`,
      body
    );
    return data;
  });
}

/* ---------------------------- Optional Helpers ---------------------------- */
export const isSandbox = PI_ENV !== 'production';
export { client as _piAxios }; // exposed for tests / diagnostics
