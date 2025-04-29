// pages/api/competitions/[id].js
import clientPromise from '../../../src/lib/mongodb';

export default async function handler(req, res) {
  const { id } = req.query;

  // Validate a 24-char hex ObjectID
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(); // uses DB from your MONGODB_URI

    if (req.method === 'DELETE') {
      const result = await db
        .collection('competitions')
        .deleteOne({ _id: new client.constructor.ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json({ message: 'Deleted' });
    }

    // If other methods come later, handle them here
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
