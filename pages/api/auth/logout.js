// pages/api/auth/logout.js
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  res.setHeader('Set-Cookie', serialize('session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  }));

  res.status(204).end();
}
