let Pi;

export async function initiatePiPayment(amount, memo, uid) {
  if (typeof window !== 'undefined') {
    const sdk = await import('@pinetwork-js/sdk');
    Pi = sdk.Pi;
  } else {
    console.error("❌ Pi SDK must only run client-side");
    return;
  }

  Pi.init({ version: "2.0", sandbox: true });

  return new Promise((resolve, reject) => {
    Pi.authenticate(['username', 'payments'], async (authData) => {
      if (!authData?.accessToken) return reject("Auth failed");

      Pi.createPayment({
        amount: amount.toString(),
        memo,
        metadata: { uid }
      }, {
        onReadyForServerApproval: async (paymentId) => {
          await fetch('/api/pi/approve-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          await fetch('/api/pi/complete-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
          resolve({ status: 'completed', paymentId, txid });
        },
        onCancel: () => reject('User cancelled'),
        onError: (err) => reject(err),
      });
    });
  });
}
