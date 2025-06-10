// lib/pi.js

export async function loadPiSdk() {
  if (typeof window === 'undefined') return;

  return new Promise((resolve, reject) => {
    if (window.Pi) {
      window.Pi.init({ version: '2.0' });
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      window.Pi.init({ version: '2.0' });
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Pi SDK'));
    document.body.appendChild(script);
  });
}

export async function loginWithPi() {
  try {
    const scopes = ['username', 'payments'];
    const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
   console.log('✅ Authenticated:', authResult);

// ✅ Save user for reuse in payment
localStorage.setItem('piUser', JSON.stringify(authResult.user));

return authResult;

    console.error('❌ Login failed:', error);
    throw error;
  }
}

function onIncompletePaymentFound(payment) {
  console.warn('⚠️ Incomplete payment found:', payment);
  // Optional: complete it here if needed
  if (payment?.identifier && payment?.transaction?.txid) {
    fetch('/api/payments/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: payment.identifier,
        txid: payment.transaction.txid,
      }),
    });
  }
}

export async function makePiPayment({ entryFee, competitionSlug, quantity, uid }) {
  try {
    const current = await fetchCurrentPaymentSafe();
    if (current && ['INCOMPLETE', 'PENDING'].includes(current.status)) {
      console.warn('⚠️ Existing unresolved payment.');
      return;
    }

    const amount = (entryFee * quantity).toFixed(8);

    const payment = window.Pi.createPayment({
      amount,
      memo: `Ticket purchase for ${competitionSlug}`,
      metadata: { competitionSlug, quantity, uid },

      onReadyForServerApproval: async (paymentId) => {
        console.log('🟢 Approving payment:', paymentId);
        await fetch('/api/payments/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, uid, competitionSlug, amount: parseFloat(amount) }),
        });
      },

      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log('🟢 Completing payment:', paymentId, txid);
        await fetch('/api/payments/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid, uid }),
        });
        alert('✅ Payment successful!');
      },

      onCancelled: () => {
        console.warn('❌ Payment cancelled');
        alert('Payment was cancelled.');
      },

      onError: (err) => {
        console.error('❌ Payment error:', err);
        alert(`Payment error: ${err?.message || 'Unknown error'}`);
      },
    });

    return payment;
  } catch (err) {
    console.error('❌ Unexpected error in makePiPayment:', err);
    alert('Unexpected error. Check console.');
  }
}

async function fetchCurrentPaymentSafe() {
  try {
    return await window.Pi.createPayment.fetchCurrentPayment();
  } catch (err) {
    return null;
  }
}
