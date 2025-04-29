// pages/api/competitions/index.js
import clientPromise from '../../../src/lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();

    if (req.method === 'GET') {
      const comps = await db
        .collection('competitions')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      return res.status(200).json(comps);
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error('GET /api/competitions error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
