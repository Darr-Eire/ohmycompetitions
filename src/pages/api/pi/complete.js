// /src/pages/api/pi/complete.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'Missing paymentId or txid' });
  }

  try {
    const result = await axios.post(
      'https://api.minepi.com/payments/complete',
      { paymentId, txid },
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({ success: true, result: result.data });
  } catch (err) {
    console.error('❌ Pi payment completion failed:', err.response?.data || err.message);
    return res.status(500).json({
      error: 'Pi completion failed',
      details: err.response?.data || err.message,
    });
  }
}
