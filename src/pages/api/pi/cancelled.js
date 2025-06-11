// /pages/api/pi/cancelled.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId, uid, reason } = req.body;

  if (!paymentId || !uid) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.minepi.com/payments/cancel', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`, // Make sure this is set
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        metadata: {
          uid,
          reason,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Cancel failed', details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Cancel failed:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
