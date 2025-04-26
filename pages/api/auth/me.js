import { parse } from 'cookie';

export default function handler(req, res) {
  const { session } = parse(req.headers.cookie || '');
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = JSON.parse(session);
  res.status(200).json(user);
}
