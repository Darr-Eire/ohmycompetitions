// /src/pages/api/pi/cancelled.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    const response = await axios.post(
      'https://api.minepi.com/payments/cancel',
      { paymentId },
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.status === 'cancelled') {
      return res.status(200).json({ cancelled: true });
    } else {
      return res.status(500).json({ error: 'Cancel failed', details: response.data });
    }
  } catch (err) {
    console.error('❌ Cancel error:', err?.response?.data || err.message);
    return res.status(500).json({
      error: 'Cancel failed',
      details: err?.response?.data || err.message,
    });
  }
}
