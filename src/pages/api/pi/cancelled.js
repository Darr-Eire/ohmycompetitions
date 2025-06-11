// /src/pages/api/pi/cancelled.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    const response = await axios.post(
      `https://api.minepi.com/testnet/v2/payments/${paymentId}/cancel`, // 👈 use testnet here
      {}, // no body required
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `Payment ${paymentId} cancelled successfully`,
      data: response.data,
    });
  } catch (error) {
    console.error('❌ Cancel error:', error?.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to cancel payment',
      raw: error?.response?.data || error.message,
    });
  }
}
