import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentId, txid } = req.body;

  try {
    const response = await axios.post('https://api.minepi.com/payments/complete', {
      paymentId,
      txid,
    }, {
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('❌ Complete failed:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Completion failed' });
  }
}
