import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    const purchases = await db
      .collection('piCashPurchases')
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    const activity = purchases.map((doc) => ({
      username: doc.username || 'Anonymous',
      quantity: doc.quantity || 1,
      timestamp: doc.timestamp?.toISOString() || new Date().toISOString(),
    }));

    res.status(200).json(activity);
  } catch (error) {
    console.error('[❌] Error fetching activity feed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
