import nextConnect from 'next-connect';
import { sessionMiddleware } from '../session';
import { createPiPayment } from '../../src/lib/pi';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post(async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { amount, memo } = req.body;
  if (!amount) return res.status(400).json({ error: 'Missing amount' });

  try {
    const paymentId = await createPiPayment({
      amount,
      memo,
      metadata: { user: req.session.user.publicAddress }
    });
    res.status(200).json({ paymentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});