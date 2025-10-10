// src/pages/api/auth/login.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { accessToken } = req.body || {};
    if (!accessToken) return res.status(400).json({ message: 'Missing accessToken' });

    // Verify with Pi (Testnet)
    const r = await fetch('https://api.minepi.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Authorization-Api-Key': process.env.PI_API_KEY_TESTNET,
      },
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(401).json({ message: `Pi verify failed: ${t}` });
    }

    const me = await r.json(); // { uid, username, ... }

    // TODO: upsert user in DB if needed
    // const user = await User.findOneAndUpdate({ uid: me.uid }, {...}, { upsert: true, new: true })

    return res.status(200).json({
      success: true,
      user: {
        uid: me.uid,
        username: me.username,
      },
    });
  } catch (e) {
    console.error('Pi auth error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
