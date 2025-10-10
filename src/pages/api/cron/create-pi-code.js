import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_DB_URL;const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db();

    const now = new Date();
    const weekStart = new Date();
    weekStart.setUTCHours(15, 14, 0, 0); // Monday 3:14 PM UTC
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());

    const expiresAt = new Date(weekStart.getTime() + (31 * 60 + 4) * 60 * 1000);
    const drawAt = new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000); // Friday same time
    const claimExpiresAt = new Date(drawAt.getTime() + (31 * 60 + 4) * 1000);

    const code = 'SEED-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const exists = await db.collection('pi_cash_codes').findOne({ weekStart: weekStart.toISOString() });

    if (exists) {
      return res.status(200).json({ message: 'Code already exists', code: exists.code });
    }

    await db.collection('pi_cash_codes').insertOne({
      code,
      prizePool: 15000,
      weekStart: weekStart.toISOString(),
      expiresAt: expiresAt.toISOString(),
      drawAt: drawAt.toISOString(),
      claimExpiresAt: claimExpiresAt.toISOString(),
      createdAt: new Date(),
    });

    return res.status(200).json({ message: '✅ New Pi Cash Code created!', code });
  } catch (err) {
    console.error('❌ Cron error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}
