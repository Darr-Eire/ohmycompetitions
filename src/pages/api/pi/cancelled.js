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
    const response = await fetch(`https://api.minepi.com/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
      Authorization: `Key ${process.env.PI_API_KEY}`

        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Cancel failed', details: data });
      }
      return res.status(200).json(data);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON from Pi API:', text);
      return res.status(500).json({ error: 'Invalid response from Pi API', raw: text });
    }
  } catch (error) {
    console.error('❌ Cancel request failed:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
