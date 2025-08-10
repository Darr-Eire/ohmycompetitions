import { getDb } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    slug,
    title,
    entryFee,
    totalTickets,
    ticketsSold = 0,
    status = 'active',
    published = true,
    ...rest
  } = req.body || {};

  if (!slug || !title || typeof entryFee !== 'number' || typeof totalTickets !== 'number') {
    return res.status(400).json({ error: 'slug, title, entryFee(number), totalTickets(number) required' });
  }

  const db = await getDb();
  const competitions = db.collection('competitions');
  await competitions.createIndex({ slug: 1 }, { unique: true });

  const doc = {
    slug: slug.toString().trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''),
    title,
    entryFee,
    totalTickets,
    ticketsSold,
    status,
    published,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...rest, // prizeLabel, imageUrl, etc.
  };

  // insert if not exists
  const exists = await competitions.findOne({ slug: doc.slug }, { projection: { _id: 1 } });
  if (exists) return res.status(409).json({ error: 'Competition slug already exists' });

  const result = await competitions.insertOne(doc);
  return res.status(201).json({ ok: true, slug: doc.slug, id: result.insertedId });
}
