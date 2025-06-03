import { connectToDatabase } from 'lib/dbConnect';
import Payment from '@models/Payment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectToDatabase();

  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const payments = await Payment.aggregate([
      { $group: { _id: "$competitionId", total: { $sum: "$amount" } } }
    ]);

    res.status(200).json(payments);
  } catch (err) {
    console.error('[PAYMENTS AGGREGATION ERROR]', err);
    res.status(500).json({ error: 'Failed to retrieve payment data' });
  }
}
