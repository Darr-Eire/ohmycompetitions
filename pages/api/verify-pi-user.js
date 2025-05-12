// pages/api/verify-pi-user.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Missing access token' });
  }

  try {
    const result = await fetch('https://api.minepi.com/v2/me', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error('🔒 Pi API Error:', errorText);
      return res.status(401).json({ error: 'Invalid Pi token' });
    }

    const user = await result.json();

    const token = jwt.sign({ uid: user.uid, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`);
    return res.status(200).json({ user });

  } catch (error) {
    console.error('🔒 Token verification failed:', error);
    return res.status(500).json({ error: 'Server error verifying token' });
  }
}

