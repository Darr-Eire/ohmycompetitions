import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-dev-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing accessToken' });
  }

  try {
    // Call Pi Network's `/me` endpoint to verify token
    const piRes = await fetch('https://api.minepi.com/v2/me', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!piRes.ok) {
      return res.status(401).json({ error: 'Invalid Pi token' });
    }

    const user = await piRes.json();

    // Issue your own session token
    const sessionToken = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.setHeader('Set-Cookie', `pi_token=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);

    return res.status(200).json({ user });
  } catch (err) {
    console.error('❌ Pi login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
