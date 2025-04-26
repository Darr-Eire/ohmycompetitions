// pages/api/auth/me.js
export default function handler(req, res) {
  const { session } = req.cookies;
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  const user = JSON.parse(session);
  res.status(200).json(user);
}
