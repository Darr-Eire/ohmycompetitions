import nextConnect from 'next-connect';
import { sessionMiddleware } from '../session';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post((req, res) => {
  const { token, publicAddress } = req.body;
  if (!token || !publicAddress) {
    return res.status(400).json({ error: 'Missing auth data' });
  }
  req.session.user = { publicAddress, token };
  req.session.save(() => res.status(200).json({ ok: true }));
});

export default handler;