// pages/api/auth/pi-login.js or verify-pi-user.js
export default async function handler(req, res) {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'No token provided' });
  }

  console.log('Received accessToken:', accessToken);

  const piRes = await fetch('https://api.minepi.com/v2/me', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!piRes.ok) {
    const error = await piRes.text();
    console.error('❌ Pi verification failed:', error);
    return res.status(401).json({ error: 'Invalid Pi token' });
  }

  const user = await piRes.json();
  console.log('✅ Verified user:', user);

  res.status(200).json({ user });
}
