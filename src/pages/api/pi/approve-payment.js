import axios from 'axios';
import { dbConnect } from '@/lib/dbConnect';
import Payment from '@/models/Payment';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId, uid, competitionSlug, amount } = req.body;

  if (!paymentId || !uid || !amount) {
    return res.status(400).json({ error: 'Missing required payment data' });
  }

  try {
    await dbConnect();

    await Payment.create({
      paymentId,
      uid,
      competitionSlug,
      amount,
    });

    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {},
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.error('❌ Approve failed:', err.response?.data || err.message);
    res.status(500).json({ error: 'Approval failed' });
  }
}
