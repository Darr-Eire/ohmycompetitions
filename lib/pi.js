import PiSDK from 'pi-sdk';

let pi;

export function getPi() {
  if (!pi) {
    pi = new PiSDK({
      apiKey: process.env.PI_API_KEY,
      publicKey: process.env.PI_PUBLIC_KEY,
      secretKey: process.env.PI_SECRET_SEED,
    });
  }
  return pi;
}

export async function verifyPiLogin(authCode) {
  const sdk = getPi();
  // Replace with actual Pi login verification API call
  const user = await sdk.verifyLogin({ authCode });
  return user; // { id, username, ... }
}

export async function createPiPayment({ userId, amount, currency, redirectUrl }) {
  const sdk = getPi();
  const payment = await sdk.createPayment({
    amount: amount.toString(),
    currency,
    redirectUrl,
  });
  return payment.paymentUrl || payment.url;
}
