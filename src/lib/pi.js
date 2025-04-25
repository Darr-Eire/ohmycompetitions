/* File: src/lib/pi.js */
import { Pi } from '@pinetwork-js/sdk';

let initialized = false;
export function getPi() {
  if (!initialized) {
    Pi.init({ version: '2.0' });
    initialized = true;
  }
  return Pi;
}

export async function verifyPiLogin() {
  const sdk = getPi();
  return await sdk.authenticate(['payments'], () => {});
}

export function createPiPayment({ amount, memo, metadata }) {
  const sdk = getPi();
  return new Promise((resolve, reject) => {
    sdk.createPayment(
      { amount: parseFloat(amount), memo, metadata },
      {
        onReadyForServerApproval(paymentId) {
          resolve(paymentId);
        },
        onError(err) {
          reject(err);
        }
      }
    );
  });
}