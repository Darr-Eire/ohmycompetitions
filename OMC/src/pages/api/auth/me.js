import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-dev-secret-key';

export default function handler(req, res) {
  // Parse cookies from request
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.pi_token;

  if (!token) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ user: decoded });
  } catch (err) {
    console.error('Session token error:', err);
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}
