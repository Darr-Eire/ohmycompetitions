import { getUserFromToken } from 'lib/auth';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserFromToken(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({
    message: `Welcome back, ${user.username}!`,
    uid: user.uid,
  });
}
