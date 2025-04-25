import nextConnect from 'next-connect';
import { sessionMiddleware } from '../../../lib/session';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post((req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.status(200).json({ success: true });
  });
});

export default handler;
