import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-dev-secret-key';

export default function handler(req, res) {
  const token = req.cookies.pi_token;

  if (!token) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid session token' });
  }
}
