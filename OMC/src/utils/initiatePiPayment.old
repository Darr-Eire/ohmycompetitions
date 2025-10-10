export const initiatePiPayment = async (amount, memo, uid) => {
  if (typeof window === 'undefined' || !window.Pi) {
    throw new Error('❌ Pi SDK not available');
  }

  return new Promise((resolve, reject) => {
    window.Pi.createPayment(
      {
        amount: amount.toFixed(2),
        memo,
        metadata: { uid },
      },
      {
        onReadyForServerApproval: (paymentId) => {
          console.log('🔁 Ready for server approval:', paymentId);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          console.log('✅ Ready for server completion:', paymentId, txid);
          resolve({ paymentId, txid });
        },
        onCancel: (reason) => {
          console.warn('❌ Payment cancelled:', reason);
          reject(new Error('Payment cancelled'));
        },
        onError: (error) => {
          console.error('❌ Payment error:', error);
          reject(error);
        }
      }
    );
  });
};
