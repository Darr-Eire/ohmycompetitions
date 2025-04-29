// pages/api/competitions/index.js
import clientPromise from '../../../src/lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(); // Uses the database specified in MONGODB_URI

    if (req.method === 'GET') {
      const comps = await db
        .collection('competitions')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(comps);
    }

    // Method not allowed
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('GET /api/competitions error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
