// lib/piServer.js

// Approves a pending payment after onReadyForServerApproval callback
export async function approvePayment({ paymentId, uid, competitionSlug, amount }) {
  try {
    const response = await fetch('https://api.minepi.com/payments/approve', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        metadata: {
          uid,
          competitionSlug,
          amount,
        },
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

// Completes a transaction after onReadyForServerCompletion callback
export async function completePayment({ paymentId, txid }) {
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
    if (!response.ok) throw new Error(result.error || 'Pi completion failed');

    return result;
  } catch (error) {
    console.error('❌ Error completing Pi payment:', error);
    throw error;
  }
}

// Optional: Auto-handle incomplete payment if user refreshes after tx confirmed but not completed
export function onIncompletePaymentFound(payment) {
  console.warn('⚠️ Incomplete payment found:', payment);

  if (payment?.identifier && payment?.transaction?.txid) {
    fetch('/api/payments/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: payment.identifier,
        txid: payment.transaction.txid,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ Completed incomplete payment:', data);
      })
      .catch((err) => {
        console.error('❌ Error completing payment:', err);
      });
  }
}
