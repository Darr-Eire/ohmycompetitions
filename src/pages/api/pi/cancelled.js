// pages/api/pi/cancelled.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    const response = await fetch(`https://api.minepi.com/payments/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentId })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Pi cancel failed:', result);
      return res.status(500).json({ error: 'Cancel failed', details: result });
    }

    res.status(200).json({ cancelled: true });
  } catch (error) {
    console.error('❌ Cancel error:', error);
    res.status(500).json({ error: 'Cancel failed', details: error.message });
  }
}
