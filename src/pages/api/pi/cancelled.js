// /src/pages/api/pi/cancelled.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing paymentId' });
  }

  try {
    // Log or mark this payment as cancelled in your DB if you track them
    console.log('❌ Cancelled Pi paymentId:', paymentId);

    // Return confirmation (you can extend this to actually update DB if needed)
    return res.status(200).json({ cancelled: true });
  } catch (err) {
    console.error('❌ Pi cancel failed:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
