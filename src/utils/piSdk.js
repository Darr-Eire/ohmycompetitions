const SERVER_URL = 'http://localhost:5000'; // Or ngrok URL in production

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
  console.log('Incomplete payment:', payment);
}

export async function makePiPayment() {
  const paymentData = {
    amount: 0.01,
    memo: 'Test Pi payment',
    metadata: { orderId: 'test_order_123' },
  };

  Pi.createPayment(paymentData, {
    onReadyForServerApproval: async (paymentId) => {
      await fetch(`${SERVER_URL}/payments/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
    },
    onReadyForServerCompletion: async (paymentId, txid) => {
      await fetch(`${SERVER_URL}/payments/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
    },
    onCancel: (paymentId) => {
      console.log('Payment cancelled:', paymentId);
    },
    onError: (error, payment) => {
      console.error('Payment error:', error);
    }
  });
}
