// lib/auth.js (recommended to reuse across files)
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export function getUserFromToken(req) {
  try {
    const { token } = cookie.parse(req.headers.cookie || '');
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
