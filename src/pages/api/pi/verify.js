// pages/api/pi/verify.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Missing access token' });

  try {
    const { data } = await axios.get('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.status(200).json(data);
  } catch (e) {
    console.error('❌ Token verification failed:', e?.response?.data || e.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
