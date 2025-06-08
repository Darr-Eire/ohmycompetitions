import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId } = req.body;
  const appAccessKey = process.env.PI_API_KEY;  // Make sure this is your Mainnet Key

  try {
    await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
      headers: { Authorization: `Key ${appAccessKey}` }
    });

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Approval failed' });
  }
}
