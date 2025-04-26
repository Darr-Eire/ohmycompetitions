// src/pages/api/auth/pi-login.js
import nextConnect from 'next-connect';
import { sessionMiddleware } from '../session'; // adjust path if needed


const handler = nextConnect();

handler.use(sessionMiddleware);

handler.post(async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Missing accessToken' });
  }

  try {
    // Verify the token with Pi's Platform API
    const piRes = await fetch('https://api.minepi.com/v2/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!piRes.ok) {
      const errBody = await piRes.text();
      console.error('[PI_LOGIN] Token verification failed:', piRes.status, errBody);
      return res.status(401).json({ error: 'Invalid access token' });
    }

    const piData = await piRes.json();
    const user = {
      uid: piData.user.uid,
      username: piData.user.username,
      wallet_address: piData.user.wallet_address,
    };

    // Store user in session
    req.session.user = user;
    req.session.save(err => {
      if (err) {
        console.error('[PI_LOGIN] Session save error:', err);
        return res.status(500).json({ error: 'Session save failed' });
      }
      return res.status(200).json({ ok: true, user });
    });
  } catch (err) {
    console.error('[PI_LOGIN] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback for other methods
handler.all((req, res) => {
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});

export default handler;
