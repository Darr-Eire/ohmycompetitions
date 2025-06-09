import { dbConnect } from '@/lib/dbConnect';
import Payment from '@/models/Payment';

export default async function handler(req, res) {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: 'Missing uid' });
  }

  try {
    await dbConnect();

    const pending = await Payment.findOne({
      uid,
      status: { $in: ['PENDING'] },
    }).sort({ timestamp: -1 });

    return res.status(200).json({
      pending: !!pending,
      paymentId: pending?.paymentId || null
    });
  } catch (err) {
    console.error('Status check error:', err.message);
    return res.status(500).json({ error: 'Server error checking payment status' });
  }
}
