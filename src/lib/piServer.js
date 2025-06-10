// lib/piServer.js

/**
 * Approves a pending payment after `onReadyForServerApproval`
 * @param {Object} params
 * @param {string} params.paymentId
 * @param {string} params.uid
 * @param {string} params.competitionSlug
 * @param {number|string} params.amount
 */
export async function approvePiPayment({ paymentId, uid, competitionSlug, amount }) {
  try {
    const response = await fetch('https://api.minepi.com/payments/approve', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        metadata: { uid, competitionSlug, amount },
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Pi approval failed');

    return result;
  } catch (error) {
    console.error('❌ Error approving Pi payment:', error);
    throw error;
  }
}

/**
 * Completes a payment after `onReadyForServerCompletion`
 * @param {Object} params
 * @param {string} params.paymentId
 * @param {string} params.txid
 */
export async function completePiPayment({ paymentId, txid }) {
  try {
    const response = await fetch('https://api.minepi.com/payments/complete', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId, txid }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Completion failed');

    return result;
  } catch (err) {
    console.error('❌ Error completing Pi payment:', err);
    throw err;
  }
}

/**
 * Verifies a completed transaction via your backend
 * @param {Object} params
 * @param {string} params.paymentId
 * @param {string} params.txid
 */
export async function verifyPiTransaction({ paymentId, txid }) {
  try {
    const response = await fetch('https://api.minepi.com/payments/' + paymentId, {
      method: 'GET',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!response.ok || result.transaction.txid !== txid) {
      throw new Error('Transaction verification failed');
    }

    return result;
  } catch (error) {
    console.error('❌ Transaction verification error:', error);
    throw error;
  }
}
