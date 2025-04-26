// pages/api/auth/pi-login.js

import nextConnect from 'next-connect';
import { sessionMiddleware } from '../session';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post(async (req, res) => {
  // Log the incoming body for debugging
  console.log('[api/auth/pi-login] req.body:', req.body);

  const { token, signature, publicAddress } = req.body;

  if (!token || !publicAddress) {
    console.warn('[api/auth/pi-login] Missing auth data:', req.body);
    return res.status(400).json({ error: 'Missing auth data' });
  }

  // TODO: Optionally verify the token/signature here before saving to session

  // Store user in session
  req.session.user = { publicAddress, token, signature };

  req.session.save(err => {
    if (err) {
      console.error('[api/auth/pi-login] session save error:', err);
      return res.status(500).json({ error: 'Failed to save session' });
    }
    console.log('[api/auth/pi-login] session saved for:', publicAddress);
    res.status(200).json({ ok: true });
  });
});

export default handler;
