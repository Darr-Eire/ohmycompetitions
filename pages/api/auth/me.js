import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-dev-secret-key';

export default function handler(req, res) {
  const token = req.cookies?.pi_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid session' });
  }
}
