import axios from 'axios';
import { verifyPayment } from '../../../lib/piServer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId } = req.body;
  const appAccessKey = process.env.PI_API_KEY;
  const developerSecret = process.env.PI_SECRET_KEY;

  try {
    const { data: payment } = await axios.get(
      `https://api.minepi.com/v2/payments/${paymentId}`,
      { headers: { Authorization: `Key ${appAccessKey}` } }
    );

    const valid = verifyPayment(payment, developerSecret);
    if (!valid) return res.status(400).json({ error: 'Invalid payment signature' });

    // (Optional: Validate metadata competitionSlug, quantity, etc here)

    await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {},
      { headers: { Authorization: `Key ${appAccessKey}` } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Approve Error', err);
    res.status(500).json({ error: 'Server error approving payment' });
  }
}
