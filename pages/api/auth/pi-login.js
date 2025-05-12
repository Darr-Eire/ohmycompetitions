import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-dev-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });

  try {
    const piRes = await fetch('https://api.minepi.com/v2/me', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!piRes.ok) return res.status(401).json({ error: 'Invalid Pi token' });

    const user = await piRes.json();

    const token = jwt.sign(
      { uid: user.uid, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.setHeader(
      'Set-Cookie',
      `pi_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
    );

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
