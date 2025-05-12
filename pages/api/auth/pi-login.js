// pages/api/auth/pi-login.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-dev-secret';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    // Validate accessToken with Pi Network
    const result = await fetch('https://api.minepi.com/v2/me', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!result.ok) {
      return res.status(401).json({ error: 'Invalid Pi token' });
    }

    const user = await result.json();

    // Generate a JWT or handle session
    const token = jwt.sign(
      { uid: user.uid, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.setHeader(
      'Set-Cookie',
      `pi_token=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`
    );

    return res.status(200).json({ user });
  } catch (error) {
    console.error('❌ Pi login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
