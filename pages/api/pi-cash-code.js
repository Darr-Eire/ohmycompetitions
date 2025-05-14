import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'ohmycompetitions';

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('pi_cash_codes');

    const today = new Date();
    const weekStart = new Date(today.setUTCHours(0, 0, 0, 0));
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 1); // Monday

    const weekStartStr = weekStart.toISOString().split('T')[0];

    const doc = await collection.findOne({ weekStart: weekStartStr });

    if (!doc) {
      return res.status(404).json({ error: 'No code available for this week.' });
    }

    return res.status(200).json(doc);
  } catch (err) {
    console.error('[API] Failed to fetch Pi Cash Code:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
