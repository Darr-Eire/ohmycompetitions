import axios from 'axios';
import { verifyPayment } from '../../../lib/piServer';
import dbConnect from '../../../lib/dbConnect';
import Competition from '../../../models/Competition';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId } = req.body;

  try {
    const appAccessKey = process.env.PI_API_KEY;
    const developerSecret = process.env.PI_SECRET_KEY;

    const { data: payment } = await axios.get(
      `https://api.minepi.com/v2/payments/${paymentId}`,
      { headers: { Authorization: `Key ${appAccessKey}` } }
    );

    const isValid = verifyPayment(payment, developerSecret);
    if (!isValid) return res.status(400).json({ error: 'Invalid signature' });

    const { competitionSlug, quantity } = payment.metadata;

    await dbConnect();
    await Competition.updateOne(
      { slug: competitionSlug },
      { $inc: { 'comp.ticketsSold': quantity } }
    );

    await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {},
      { headers: { Authorization: `Key ${appAccessKey}` } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
