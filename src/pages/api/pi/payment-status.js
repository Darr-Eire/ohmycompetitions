// /api/pi/payment-status.js
export default async function handler(req, res) {
  const { paymentId, accessToken } = req.query;

  if (!paymentId || !accessToken) {
    return res.status(400).json({ error: 'Missing paymentId or accessToken' });
  }

  try {
    const response = await fetch(`https://api.minepi.com/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch payment status', details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error fetching payment status:', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
