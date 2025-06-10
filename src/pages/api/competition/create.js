import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  // Auth check
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // DB connection
  try {
    await dbConnect();
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    return res.status(500).json({ error: 'Database connection error' });
  }

  const { title, imageUrl, prize, ipfsHash } = req.body;

  // Validation
  if (!title || !prize) {
    return res.status(400).json({ error: 'Missing required fields: title and prize' });
  }

  try {
    const competition = await Competition.create({
      title,
      imageUrl: imageUrl || '',
      prize,
      ipfsHash: ipfsHash || '',
      createdAt: new Date(),
    });

    return res.status(201).json({ message: 'Competition created', competition });
  } catch (err) {
    console.error('[❌ COMPETITION CREATE ERROR]', err);
    return res.status(500).json({ error: 'Failed to create competition', detail: err.message });
  }
}
