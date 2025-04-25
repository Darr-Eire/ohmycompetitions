import nextConnect from 'next-connect';
import { sessionMiddleware } from '../../../lib/session';
import { verifyPiLogin } from '../../../lib/pi';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post(async (req, res) => {
  const { authCode } = req.body;
  try {
    const user = await verifyPiLogin(authCode);
    req.session.user = user;
    req.session.save(err => {
      if (err) return res.status(500).json({ error: 'Session save error' });
      res.status(200).json({ user });
    });
  } catch (err) {
    res.status(500).json({ error: 'Login verification failed' });
  }
});

export default handler;
