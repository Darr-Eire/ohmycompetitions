// PATH: src/lib/pi/PiBackendIntegration.js
// Frontend-safe shim around your Next.js API routes (NO server keys in the browser).

/**
 * Minimal JSON POST wrapper.
 * Throws with server-provided body on non-2xx.
 */
async function _post(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const text = await r.text();
  if (!r.ok) {
    // why: surface backend details for quick debugging
    throw new Error(text || `HTTP ${r.status}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Thin client for server routes:
 *   /api/pi/payments/approve
 *   /api/pi/payments/complete
 *   /api/pi/payments/cancel
 */
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
   * @param {string} accessToken  user access token from Pi.authenticate
   * @returns {Promise<void>}
   */
  static async completePiNetworkPayment(paymentId, txid, accessToken) {
    if (!paymentId || !txid || !accessToken) {
      throw new Error('completePiNetworkPayment: paymentId, txid, accessToken required');
    }
    await _post('/api/pi/payments/complete', { paymentId, txid, accessToken });
  }

  /**
   * Cancel a pending/incomplete payment on the server.
   * Safe to call even if already completed/cancelled.
   * @param {string} paymentId
   * @returns {Promise<void>}
   */
  static async cancelPiNetworkPayment(paymentId) {
    if (!paymentId) return;
    await _post('/api/pi/payments/cancel', { paymentId });
  }
}

export default PiNetworkService;
