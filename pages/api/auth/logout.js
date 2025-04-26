// pages/api/auth/logout.js

import nextConnect from 'next-connect';
import { sessionMiddleware } from '../session';  // ← one level up into pages/api

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post((req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.setHeader('Set-Cookie', ''); // clear cookie
    res.status(200).json({ ok: true });
  });
});

export default handler;
