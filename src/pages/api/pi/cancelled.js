// src/pages/api/pi/cancelled.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    const response = await fetch('https://api.minepi.com/payments/cancelled', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Pi cancel failed', details: data });
    }

    return res.status(200).json({ cancelled: true, result: data });
  } catch (err) {
    console.error('❌ Cancel payment error:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
