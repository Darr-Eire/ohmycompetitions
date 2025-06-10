import axios from 'axios';

export default async function handler(req, res) {
  const { paymentId, txid } = req.body;

  try {
    await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, { txid }, {
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
