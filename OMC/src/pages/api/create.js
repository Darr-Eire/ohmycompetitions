// pages/api/payments/create.js

import nextConnect from 'next-connect';
const handler = nextConnect();
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
