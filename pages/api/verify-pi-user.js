import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Missing access token' });
  }

  try {
    // Correct: Pi's /me endpoint expects GET
    const response = await fetch('https://api.minepi.com/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pi API error: ${errText}`);
    }

    const userData = await response.json(); // { uid, username }

    // ✅ Generate a JWT
    const token = jwt.sign(
      { uid: userData.uid, username: userData.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Set token in secure cookie
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`);

    return res.status(200).json({ user: userData });

  } catch (error) {
    console.error('🔒 Verification failed:', error);
    return res.status(401).json({ error: 'Invalid Pi login token' });
  }
}
