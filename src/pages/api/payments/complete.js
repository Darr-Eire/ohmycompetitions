import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId, txid } = req.body;

  try {
    const appAccessKey = process.env.PI_API_KEY;

    await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid },
      { headers: { Authorization: `Key ${appAccessKey}` } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Complete error:', err);
    res.status(500).json({ error: 'Server error completing payment' });
  }
}
