import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { accessToken } = req.body;

  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid access token' });
  }

  try {
    const piResponse = await axios.get('https://api.minepi.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const { uid, username, wallet } = piResponse.data;

    if (!uid || !username) {
      throw new Error('Missing uid or username in Pi response');
    }

    return res.status(200).json({ uid, username, wallet });
  } catch (err) {
    console.error('❌ Pi verification failed:', {
      status: err?.response?.status,
      data: err?.response?.data,
      message: err.message,
    });

    return res.status(401).json({ error: 'Invalid or expired Pi token' });
  }
}
