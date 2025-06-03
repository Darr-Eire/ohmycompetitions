import nextConnect from 'next-connect';


import { createPiPayment } from '@lib/piServer';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post(async (req, res) => {
  const user = req.session?.user;

  if (!user || !user.publicAddress) {
    return res.status(401).json({ error: 'Unauthorized: missing user session' });
  }

  const { amount, memo } = req.body;

  if (!amount || !memo) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  try {
    const paymentUrl = await createPiPayment({
      amount,
      memo,
      metadata: { user: user.publicAddress }
    });

    res.status(200).json({ paymentUrl });
  } catch (err) {
    console.error('[PAYMENT CREATE ERROR]', err);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

export default handler;
