// src/utils/piSdk.js

export async function loginWithPi() {
  try {
    const scopes = ['username', 'payments'];

    const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
    console.log('✅ Authenticated:', authResult);

    // Optionally send user to backend
    await fetch('/api/auth/pi-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: authResult.accessToken }),
    });

    return authResult;
  } catch (error) {
    console.error('❌ Login failed:', error);
  }
}

function onIncompletePaymentFound(payment) {
  console.warn('⚠️ Incomplete payment found:', payment);
  // Optional: auto-complete or alert user
}

export async function makePiPayment(entryFee, competitionSlug, quantity) {
  try {
    const currentPayment = await fetchCurrentPaymentSafe();
    if (currentPayment && ['INCOMPLETE', 'PENDING'].includes(currentPayment.status)) {
      console.warn('⚠️ Pending payment exists, resolve before continuing.');
      return;
    }

    const paymentData = {
      amount: (entryFee * quantity).toFixed(8),
      memo: `Ticket purchase for ${competitionSlug}`,
      metadata: { competitionSlug, quantity },
    };

    const payment = window.Pi.createPayment(paymentData, {
      onReadyForServerApproval: async (paymentId) => {
        await fetch(`/api/payments/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        await fetch(`/api/payments/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid }),
        });
      },
      onCancelled: () => {
        console.log('⛔ Payment cancelled');
      },
      onError: (err) => {
        console.error('🚨 Payment error:', err);
      },
    });

    console.log('📤 Payment initiated:', payment);
  } catch (err) {
    console.error('💥 makePiPayment error:', err);
  }
}

async function fetchCurrentPaymentSafe() {
  try {
    return await window.Pi.createPayment.fetchCurrentPayment();
  } catch (err) {
    console.warn('ℹ️ No current payment or fetch error:', err);
    return null;
  }
}
