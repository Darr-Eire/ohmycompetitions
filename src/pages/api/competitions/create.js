import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await client.connect();
    const db = client.db('ohmycompetitions');
    const competitions = db.collection('competitions');

    const comp = req.body;

    // Basic validation
    if (!comp.slug || !comp.title || !comp.entryFee || !comp.totalTickets) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await competitions.findOne({ slug: comp.slug });
    if (existing) {
      return res.status(409).json({ error: 'Competition with this slug already exists' });
    }

    const result = await competitions.insertOne({
      ...comp,
      ticketsSold: comp.ticketsSold || 0,
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'Competition created', id: result.insertedId });
  } catch (error) {
    console.error('Mongo error:', error);
    res.status(500).json({ error: 'Database error', detail: error.message });
  } finally {
    await client.close();
  }
}
