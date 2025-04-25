import nextConnect from 'next-connect';
import { sessionMiddleware } from '../../src/lib/session';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.get((req, res) => {
  res.status(200).json({ user: req.session.user || null });
});

export default handler;
