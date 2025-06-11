// /pages/api/pi/cancelled.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    const piRes = await fetch('https://api.minepi.com/payments/cancel', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId }),
    });

    const result = await piRes.json();

    if (!piRes.ok) {
      return res.status(500).json({ error: 'Pi cancel failed', details: result });
    }

    return res.status(200).json({ cancelled: true, result });
  } catch (err) {
    console.error('❌ Cancel error:', err);
    return res.status(500).json({ error: 'Cancel failed', details: err.message });
  }
}
