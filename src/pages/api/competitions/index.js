import { connectToDatabase } from 'lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { db } = await connectToDatabase();

    const comps = await db
      .collection('competitions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100) // optional safety limit
      .toArray();

    return res.status(200).json(comps);
  } catch (err) {
    console.error('❌ GET /api/competitions failed:', err);
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
