// pages/api/pi/complete.js
export default async function handler(req, res) {
  const { paymentId, txid } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY;

  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Failed to complete');
    res.status(200).json({ message: 'Payment completed', data });
  } catch (error) {
    console.error('Completion error:', error.message);
    res.status(500).json({ error: 'Payment completion failed' });
  }
}
