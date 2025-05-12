// /pages/api/pi-cash-code/index.js
import db from '@/lib/mongodb';

export default async function handler(req, res) {
  const client = await db;
  const dbInstance = client.db();

  const latestWeek = await dbInstance.collection('piCashCode').findOne({}, { sort: { weekStart: -1 } });

  if (!latestWeek) return res.status(404).json({ error: 'No code data found' });

  res.status(200).json(latestWeek);
}
