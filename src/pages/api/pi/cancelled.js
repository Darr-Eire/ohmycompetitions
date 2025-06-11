import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentId } = req.body;

  try {
    const response = await axios.post(
      'https://api.minepi.com/payments/cancelled',
      { paymentId },
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Cancel response from Pi:', response.data);
    res.status(200).json({ cancelled: true, result: response.data });
  } catch (err) {
    console.error('❌ Pi cancel failed:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Pi cancel failed', details: err?.response?.data || err.message });
  }
}
