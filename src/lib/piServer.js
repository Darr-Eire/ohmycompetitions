// src/lib/piServer.js
import { Access } from 'pi-access-sdk';

const client = new Access({ apiKey: process.env.PI_API_KEY });

export async function createPiPayment({ amount, memo, metadata }) {
  const payment = await client.createPayment({
    amount: amount.toString(),
    memo,
    metadata,
  });
  return payment.paymentUrl || payment.url;
}
// piServer.js
export const verifyPiTransaction = () => { ... }
