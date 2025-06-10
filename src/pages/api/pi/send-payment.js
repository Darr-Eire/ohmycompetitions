import axios from 'axios';

export default async function handler(req, res) {
  const { amount, recipientUsername, memo } = req.body;

  try {
    const response = await axios.post('https://api.minepi.com/v2/payments/send', {
      amount: amount.toString(),
      memo,
      metadata: { reason: 'competition_win' },
      recipient_username: recipientUsername,
    }, {
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      auth: {
        username: process.env.PI_WALLET_PRIVATE_KEY,
        password: ''
      }
    });

    res.status(200).json({ success: true, txid: response.data.txid });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
}
