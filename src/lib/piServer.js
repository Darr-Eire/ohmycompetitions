// src/lib/piServer.js

import { Access } from 'pi-access-sdk';

// Initialize Pi Access SDK with your API Key (from environment variables)
const client = new Access({ apiKey: process.env.PI_API_KEY });

/**
 * Create a Pi Payment
 * @param {Object} param0 
 * @returns payment URL
 */
export async function createPiPayment({ amount, memo, metadata }) {
  try {
    const payment = await client.createPayment({
      amount: amount.toString(),
      memo,
      metadata,
    });

    return payment.paymentUrl || payment.url;
  } catch (error) {
    console.error('Failed to create Pi payment:', error);
    throw new Error('Payment creation failed');
  }
}

/**
 * Verify Pi Transaction after payment is completed
 * @param {string} paymentId 
 * @returns payment details if successful
 */
export async function verifyPiTransaction(paymentId) {
  try {
    const tx = await client.getPayment(paymentId);

    if (!tx) throw new Error('Transaction not found');

    if (tx.transaction && tx.transaction.txid) {
      return tx; // Payment successful and completed on blockchain
    }

    throw new Error('Transaction not completed yet');
  } catch (err) {
    console.error('Payment verification failed:', err);
    throw err;
  }
}
