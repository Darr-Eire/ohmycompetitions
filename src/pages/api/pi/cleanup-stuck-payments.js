import axios from 'axios';
import { dbConnect } from '@/lib/dbConnect';
import Payment from '@/models/Payment';

export default async function handler(req, res) {
  try {
    const { data } = await axios.get(
      'https://api.minepi.com/v2/payments/incomplete_server_payments',
      {
        headers: { Authorization: `Key ${process.env.PI_API_KEY}` },
      }
    );

    await dbConnect();

    const cancelled = [];

    for (const p of data.incomplete_server_payments) {
      if (p.status.developer_approved && p.status.transaction_verified && !p.status.developer_completed) {
        await axios.post(
          `https://api.minepi.com/v2/payments/${p.identifier}/cancel`,
          {},
          {
            headers: { Authorization: `Key ${process.env.PI_API_KEY}` },
          }
        );

        await Payment.findOneAndUpdate({ paymentId: p.identifier }, { status: 'CANCELLED' });
        cancelled.push(p.identifier);
      }
    }

    res.status(200).json({ cancelled });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Cleanup failed' });
  }
}
