import nextConnect from 'next-connect';
import { sessionMiddleware } from '../session';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post(async (req, res) => {
  console.log('[API /auth/pi-login]', req.body);

  const { token, signature, publicAddress } = req.body;
  if (!token || !publicAddress) {
    console.error('Missing auth data:', req.body);
    return res.status(400).json({ error: 'Missing auth data' });
  }

  req.session.user = { publicAddress, token, signature };
  req.session.save((err) => {
    if (err) {
      console.error('Session save failed:', err);
      return res.status(500).json({ error: 'Session save failed' });
    }
    console.log('Session successfully saved for:', publicAddress);
    res.status(200).json({ ok: true });
  });
});

export default handler;
