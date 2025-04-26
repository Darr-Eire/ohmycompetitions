import nextConnect from 'next-connect';
import { sessionMiddleware } from '../session';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.get((req, res) => {
  if (req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  res.status(401).json({ error: 'Not logged in' });
});

handler.all((req, res) => {
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});

export default handler;
