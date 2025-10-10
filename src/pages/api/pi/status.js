

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

    const text = await response.text();

    // Try parsing JSON, catch if it’s HTML or malformed
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('❌ Invalid JSON from Pi API:', text);
      return res.status(502).json({ error: 'Bad response from Pi API', raw: text });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to fetch payment status',
        details: data,
      });
    }

    console.log('✅ Payment status:', data);
    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error fetching payment status:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
