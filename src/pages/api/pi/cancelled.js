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
    const response = await fetch('https://api.minepi.com/payments/cancelled', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId }),
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(500).json({ error: 'Pi cancel failed', details });
    }

    return res.status(200).json({ cancelled: true });
  } catch (err) {
    console.error('❌ Pi cancel failed:', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
