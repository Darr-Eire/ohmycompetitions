import nextConnect from 'next-connect';
import { sessionMiddleware } from '../../lib/session';
import { createPiPayment } from '../../lib/pi';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post(async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const { amount, currency } = req.body;
  try {
    const paymentUrl = await createPiPayment({
      userId: user.id,
      amount, currency,
      redirectUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/success`,
    });
    res.status(200).json({ paymentUrl });
  } catch (err) {
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

export default handler;
