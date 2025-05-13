// pages/api/auth/pi-login.js

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-dev-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;

  if (!accessToken) {
    console.error('[❌] No accessToken provided');
    return res.status(400).json({ error: 'Missing accessToken' });
  }

  console.log('[➡️] Verifying token with Pi API');
  console.log('AccessToken:', accessToken);

  try {
  const piRes = await fetch('https://api.minepi.com/v2/me', {
  method: 'GET',

      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!piRes.ok) {
      const errorText = await piRes.text();
      console.error('[❌] Pi token verification failed:', errorText);
      return res.status(401).json({ error: 'Invalid Pi token' });
    }

    const user = await piRes.json();
    console.log('[✅] Pi user verified:', user);

    const sessionToken = jwt.sign(
      { uid: user.uid, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.setHeader(
      'Set-Cookie',
      `pi_token=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
    );

    return res.status(200).json({ user });
  } catch (err) {
    console.error('[🔥] Internal server error during Pi login:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
