// File: src/lib/pi/PiBackendIntegration.js
// Frontend-safe shim around your Next.js API routes (NO API keys in the browser).

/**
 * Minimal fetch helper
 */
// File: src/lib/pi/PiBackendIntegration.js
// Add cancel route call.

async function _post(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(txt || `HTTP ${r.status}`);
  try { return JSON.parse(txt); } catch { return txt; }
}

export class PiNetworkService {
  static async approvePiNetworkPayment(paymentId) {
    if (!paymentId) throw new Error('approvePiNetworkPayment: paymentId required');
    await _post('/api/pi/payments/approve', { paymentId });
  }
  static async completePiNetworkPayment(paymentId, txid, accessToken) {
    if (!paymentId || !txid || !accessToken) throw new Error('completePiNetworkPayment: paymentId, txid, accessToken required');
    await _post('/api/pi/payments/complete', { paymentId, txid, accessToken });
  }
  static async cancelPiNetworkPayment(paymentId) {
    if (!paymentId) return;
    await _post('/api/pi/payments/cancel', { paymentId }); // why: clear stuck/pending before new payment
  }
}

export default PiNetworkService;


export class PiNetworkService {
  /**
   * Approve a pending payment on the server.
   * @param {string} paymentId
   * @returns {Promise<void>}
   */
  static async approvePiNetworkPayment(paymentId) {
    if (!paymentId) throw new Error('approvePiNetworkPayment: paymentId required');
    await _post('/api/pi/payments/approve', { paymentId });
  }

  /**
   * Complete an approved payment on the server.
   * @param {string} paymentId
   * @param {string} txid
   * @param {string} accessToken  (user access token from Pi.authenticate)
   * @returns {Promise<void>}
   */
  static async completePiNetworkPayment(paymentId, txid, accessToken) {
    if (!paymentId || !txid || !accessToken) {
      throw new Error('completePiNetworkPayment: paymentId, txid, accessToken required');
    }
    await _post('/api/pi/payments/complete', { paymentId, txid, accessToken });
  }

  /**
   * Cancel a payment on the server if you later add an endpoint for it.
   * Currently a no-op (your API doesn’t expose cancel).
   */
  static async cancelPiNetworkPayment(/* paymentId */) {
    // Why: you don’t expose a cancel route; keep method for API parity with the snippet you got
    return;
  }
}

export default PiNetworkService;

