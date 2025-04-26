import nextConnect from 'next-connect';
import { sessionMiddleware } from '../session';

const handler = nextConnect();
handler.use(sessionMiddleware);

handler.post(async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });

  // Verify token with Pi Platform
  const piRes = await fetch('https://api.minepi.com/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!piRes.ok) return res.status(401).json({ error: 'Invalid access token' });

  const { user } = await piRes.json();
  req.session.user = user;
  req.session.save(err => {
    if (err) return res.status(500).json({ error: 'Session save failed' });
    res.status(200).json({ ok: true, user });
  });
});

// Reject other methods
handler.all((req, res) => {
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});

export default handler;
