import { Pi } from '@pinetwork-js/sdk';

/**
 * Initiates a Pi payment request
 * @param {number} amount - Amount in Pi to charge user
 * @param {string} memo - Transaction description
 * @param {string} uid - User ID (used in metadata)
 */
export async function initiatePiPayment(amount, memo, uid) {
  return new Promise((resolve, reject) => {
    Pi.init({
      version: "2.0",
      sandbox: true, // Testnet mode
    });

    Pi.authenticate(['username', 'payments'], async function (authData) {
      if (!authData.accessToken) {
        return reject("❌ Pi Authentication Failed");
      }

      Pi.createPayment(
        {
          amount: amount.toString(),
          memo,
          metadata: { userId: uid }
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            try {
              await fetch('/api/pi/approve-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId }),
              });
            } catch (err) {
              reject("❌ Approval Error: " + err.message);
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              await fetch('/api/pi/complete-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid }),
              });
              resolve({ status: 'completed', paymentId, txid });
            } catch (err) {
              reject("❌ Completion Error: " + err.message);
            }
          },
          onCancel: (paymentId) => {
            reject('❌ Payment cancelled by user');
          },
          onError: (error, paymentId) => {
            reject(`❌ SDK Error: ${error}`);
          },
        }
      );
    });
  });
}
