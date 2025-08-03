import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    const history = await db
      .collection('piCashHistory')
      .find({})
      .sort({ weekStart: -1 })
      .limit(10)
      .toArray();

    const formatted = history.map(entry => ({
      weekStart: entry.weekStart,
      code: entry.code,
      winner: entry.winner || '—'
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ Error fetching history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
