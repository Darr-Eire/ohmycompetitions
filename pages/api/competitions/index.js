// pages/api/competitions/index.js
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  try {
    // Await our MongoDB client promise
    const client = await clientPromise;
    const db = client.db(); // Uses the default database from your MONGODB_URI

    if (req.method === 'GET') {
      // Fetch all competitions, sorted by creation date descending
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
