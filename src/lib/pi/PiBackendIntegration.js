// File: src/lib/pi/PiBackendIntegration.js
// Frontend-safe shim around your Next.js API routes (NO API keys in the browser).

/**
 * Minimal fetch helper
 */
async function _post(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const text = await r.text();
  if (!r.ok) {
    // Why: surface server failure details for debugging
    throw new Error(text || `HTTP ${r.status}`);
  }
  try { return JSON.parse(text); } catch { return text; }
}

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

