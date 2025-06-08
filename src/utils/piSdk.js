export async function loginWithPi() {
  try {
    const scopes = ['username', 'payments'];
    const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
    console.log('Authenticated:', authResult);
    return authResult;
  } catch (error) {
    console.error('Login failed:', error);
  }
}

function onIncompletePaymentFound(payment) {
  console.log('Incomplete payment found at login:', payment);
  // Optional: you can automatically handle incomplete payments here if you want
}

export async function makePiPayment(entryFee, competitionSlug, quantity) {
  try {
    // Always check if any pending payment exists first
   const fetchCurrentPaymentSafe = async () => {
  try {
    return await window.Pi.createPayment.fetchCurrentPayment();
  } catch (err) {
    console.warn('No pending payment or SDK error', err);
    return null;
  }
}


    if (currentPayment) {
      if (['INCOMPLETE', 'PENDING'].includes(currentPayment.status)) {
        console.warn('Pending payment exists. Please resolve before making a new payment.');
        return;
      }
    }

    const paymentData = {
      amount: (entryFee * quantity).toFixed(8),
      memo: `Ticket purchase for ${competitionSlug}`,
      metadata: { competitionSlug, quantity },
    };

    const payment = await Pi.createPayment(paymentData);

    payment.onReadyForServerApproval(async (paymentId) => {
      await fetch(`/api/payments/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
    });

    payment.onReadyForServerCompletion(async (paymentId, txid) => {
      await fetch(`/api/payments/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txid }),
      });
    });

    payment.onCancelled(() => {
      console.log('Payment cancelled');
    });

    payment.onError((err) => {
      console.error('Payment error:', err);
    });

  } catch (err) {
    console.error('Unexpected error occurred:', err);
  }
}

async function fetchCurrentPaymentSafe() {
  try {
    return await Pi.createPayment.fetchCurrentPayment();
  } catch (err) {
    console.warn('No current payment or SDK error:', err);
    return null;
  }
}
