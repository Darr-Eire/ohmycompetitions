// pages/api/sessions.js

import nextConnect from 'next-connect';
import { sessionMiddleware } from './session';  // now in pages/api/session.js

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.get((req, res) => {
  res.status(200).json({ user: req.session.user || null });
});

export default handler;
