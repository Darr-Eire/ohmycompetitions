import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

const uri = process.env.MONGO_DB_URL;if (!uri) throw new Error('Missing MONGODB_URI in environment');
const client = new MongoClient(uri);

export default async function handler(req, res) {
  // Check session and admin role
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await client.connect();
    const db = client.db('ohmycompetitions');
    const competitions = db.collection('competitions');

    const comp = req.body;

    // Basic validation
    const required = ['slug', 'title', 'entryFee', 'totalTickets'];
    for (const field of required) {
      if (!comp[field]) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    // Check for duplicate slug
    const existing = await competitions.findOne({ slug: comp.slug });
    if (existing) {
      return res.status(409).json({ error: 'Competition slug already exists' });
    }

    // Insert competition
    const result = await competitions.insertOne({
      ...comp,
      ticketsSold: comp.ticketsSold || 0,
      createdAt: new Date(),
    });

    return res.status(201).json({ message: 'Competition created', id: result.insertedId });
  } catch (err) {
    console.error('❌ MongoDB error:', err);
    return res.status(500).json({ error: 'Database error', detail: err.message });
  } finally {
    await client.close();
  }
}
