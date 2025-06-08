import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId, txid } = req.body;
  const appAccessKey = process.env.PI_API_KEY;

  try {
    await axios.post(`https://sandbox.minepi.com/v2/payments/${paymentId}/complete`,   // <-- SANDBOX
      { txid },
      { headers: { Authorization: `Key ${appAccessKey}` }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Completion failed' });
  }
}
