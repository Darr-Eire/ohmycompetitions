// pages/api/auth/pi-login.js
export default async function handler(req, res) {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'No access token provided' });
  }

  try {
    const piRes = await fetch('https://api.minepi.com/v2/me', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await piRes.text(); // For debug
    console.log('✅ Pi API Response:', text);

    if (!piRes.ok) {
      return res.status(401).json({ error: 'Invalid Pi token' });
    }

    const user = JSON.parse(text);
    res.status(200).json({ user });
  } catch (err) {
    console.error('❌ Pi login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
