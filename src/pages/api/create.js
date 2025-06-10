// pages/api/payments/create.js

import nextConnect from 'next-connect';
import { createPiPayment } from '@lib/piServer'; // Make sure this function exists in your piServer.js
import sessionMiddleware from '@lib/session'; // Ensure you have this or remove if not needed

const handler = nextConnect();

handler.use(sessionMiddleware); // Optional — comment out if you don’t use session auth

handler.post(async (req, res) => {
  try {
    const { amount, memo, metadata } = req.body;

    if (!amount || !memo || !metadata?.uid) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const payment = await createPiPayment({
      amount,
      memo,
      metadata,
    });

    return res.status(200).json(payment);
  } catch (err) {
    console.error('❌ Payment creation error:', err);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

export default handler;
