// src/pages/api/auth/login.js

import nextConnect from 'next-connect';
import { sessionMiddleware } from '../session';  // adjust path as needed

const handler = nextConnect();

// Attach your session middleware
handler.use(sessionMiddleware);

// Handle only POST requests
handler.post(async (req, res) => {
  console.log('[API /auth/login] incoming body:', req.body);

  const { token, signature, publicAddress } = req.body;
  if (!token || !publicAddress) {
    console.error('[API /auth/login] Missing auth data:', req.body);
    return res.status(400).json({ error: 'Missing auth data' });
  }

  // Store user info in session
  req.session.user = { publicAddress, token, signature };
  req.session.save(err => {
    if (err) {
      console.error('[API /auth/login] Session save failed:', err);
      return res.status(500).json({ error: 'Session save failed' });
    }
    console.log('[API /auth/login] Session successfully saved for:', publicAddress);
    return res.status(200).json({ ok: true });
  });
});

// Reject all other HTTP methods
handler.all((req, res) => {
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});

export default handler;
