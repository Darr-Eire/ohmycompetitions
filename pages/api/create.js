// pages/api/payment/create.js
import nextConnect from 'next-connect';
import { sessionMiddleware } from './session';
import { createPiPayment } from '@lib/piServer';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post(async (req, res) => {
  // ... authorization checks ...
  const { amount, memo } = req.body;
  const paymentUrl = await createPiPayment({ amount, memo, metadata: { user: req.session.user.publicAddress }});
  res.status(200).json({ paymentUrl });
});
export default handler;
