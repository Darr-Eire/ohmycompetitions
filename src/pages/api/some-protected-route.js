import { getUserFromToken } from 'lib/auth';

export default function handler(req, res) {
  const user = getUserFromToken(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Example response for verified users
  return res.status(200).json({
    message: `Welcome back, ${user.username}!`,
    uid: user.uid,
  });
}
