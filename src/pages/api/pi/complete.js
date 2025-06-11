import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId, txid } = req.body;
  if (!paymentId || !txid) return res.status(400).json({ error: 'Missing paymentId or txid' });

  try {
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid },
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌ Complete failed:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Complete failed', raw: err?.response?.data || err.message });
  }
}
