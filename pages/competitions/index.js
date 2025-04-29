// pages/api/competitions/index.js
import clientPromise from '../../../src/lib/mongodb';

export default async function handler(req, res) {
  console.log('🟢 Invoked GET /api/competitions');
  try {
    const client = await clientPromise;
    console.log('🟢 MongoDB client connected');

    // Explicitly use the “ohmycompetitions” database:
    const db = client.db('ohmycompetitions');

    if (req.method === 'GET') {
      const comps = await db
        .collection('competitions')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      console.log(`🟢 Retrieved ${comps.length} competitions`);
      return res.status(200).json(comps);
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error('❌ GET /api/competitions error:', err);
    return res.status(500).json({ error: err.message });
  }
}
