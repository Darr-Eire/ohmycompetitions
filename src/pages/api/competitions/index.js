import { connectToDatabase } from 'lib/mongodb';  // ✅ use your alias for clean imports

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { db } = await connectToDatabase();

    const competitions = await db
      .collection('competitions')
      .find({})
      .sort({ createdAt: -1 })  // Sort newest first
      .limit(100)
      .toArray();

    return res.status(200).json(competitions);
  } catch (err) {
    console.error('❌ Failed to fetch competitions:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
