/**
 * Creates a new Pi payment via the Pi SDK
 * @param {Object} params
 * @param {string} params.uid - UID of the user making the payment
 * @param {string} params.amount - Amount of Pi to charge
 * @param {string} params.memo - Optional memo for the payment
 * @param {Object} params.metadata - Any metadata to attach
 */
export async function createPiPayment({ uid, amount, memo = '', metadata = {} }) {
  try {
    const response = await fetch('https://api.minepi.com/payments', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount.toString(),
        memo,
        metadata,
        uid,
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '❌ Failed to create Pi payment');

    return result;
  } catch (error) {
    console.error('❌ Error creating Pi payment:', error);
    throw error;
  }
}

/**
 * Approves a Pi payment after `onReadyForServerApproval`
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
    if (!response.ok) throw new Error(result.error || '❌ Pi approval failed');

    return result;
  } catch (error) {
    console.error('❌ Error approving Pi payment:', error);
    throw error;
  }
}

/**
 * Completes a Pi payment after `onReadyForServerCompletion`
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
    if (!response.ok) throw new Error(result.error || '❌ Completion failed');

    return result;
  } catch (error) {
    console.error('❌ Error completing Pi payment:', error);
    throw error;
  }
}

/**
 * Verifies a completed Pi transaction using the payment ID
 */
export async function verifyPiTransaction({ paymentId, txid }) {
  try {
    const response = await fetch(`https://api.minepi.com/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    const valid = result?.transaction?.txid === txid;

    if (!response.ok || !valid) {
      throw new Error('❌ Transaction verification failed');
    }

    return result;
  } catch (error) {
    console.error('❌ Transaction verification error:', error);
    throw error;
  }
}
