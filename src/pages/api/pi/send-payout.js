import axios from 'axios';

export default async function handler(req, res) {
  const { uid, amount, memo = 'Prize payout', metadata = {} } = req.body;

  if (!uid || !amount)
    return res.status(400).json({ error: 'Missing uid or amount' });

  try {
    const response = await axios.post(
      'https://api.minepi.com/v2/payments',
      { uid, amount, memo, metadata },
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
        },
      }
    );

    res.status(200).json({ payout: true, data: response.data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Payout failed' });
  }
}
