// src/pages/api/pi/verify.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing accessToken' });
  }

  try {
    const { data } = await axios.get('https://api.minepi.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Example expected fields: uid, username
    return res.status(200).json({
      uid: data.uid,
      username: data.username,
    });
  } catch (error) {
    console.error('❌ Pi verify error:', error.response?.data || error.message);
    return res.status(401).json({ error: 'Invalid or expired Pi accessToken' });
  }
}
