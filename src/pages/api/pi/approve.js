// /pages/api/pi/approve.js
import { connectToDatabase } from '@/lib/dbConnect';
import Payment from '@/models/Payment';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentId, uid, competitionSlug, amount } = req.body;

  if (!paymentId || !uid || !competitionSlug || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await connectToDatabase();

    await Payment.create({
      paymentId,
      uid,
      competitionSlug,
      amount,
      status: 'PENDING',
    });

    const response = await fetch('https://api.minepi.com/v2/payments/' + paymentId + '/approve', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Approval failed');

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('Approval error:', err.message);
    return res.status(500).json({ error: 'Failed to approve payment' });
  }
}
