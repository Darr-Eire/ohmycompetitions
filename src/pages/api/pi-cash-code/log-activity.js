import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, quantity } = req.body;

  if (!username || !quantity) {
    return res.status(400).json({ error: 'Missing username or quantity' });
  }

  try {
    const { db } = await connectToDatabase();

    await db.collection('piCashPurchases').insertOne({
      username,
      quantity,
      timestamp: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[❌] Error logging activity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
