// /pages/api/rewards/send.js
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { amount, recipient_uid, metadata } = req.body;

  if (!amount || !recipient_uid) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.minepi.com/v2/payments/send', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount.toString(),
        user_uid: recipient_uid,
        metadata: metadata || { type: 'reward', reason: 'competition_win' },
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Pi payment failed');

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('❌ Error sending Pi payment:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
