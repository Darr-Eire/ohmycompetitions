import { connectToDatabase } from 'lib/dbConnect';
import Competition from 'models/Competition';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectToDatabase();

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { title, imageUrl, prize, ipfsHash } = req.body;

  if (!title || !prize) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const competition = await Competition.create({
      title,
      imageUrl,
      prize,
      ipfsHash,
      createdAt: new Date()
    });

    res.status(201).json(competition);
  } catch (err) {
    console.error('[COMPETITION CREATE ERROR]', err);
    res.status(500).json({ error: 'Failed to create competition' });
  }
}
