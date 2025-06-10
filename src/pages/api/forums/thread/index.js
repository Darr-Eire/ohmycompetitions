import { connectToDatabase } from 'lib/dbConnect';import Thread from 'models/Thread';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const threads = await Thread.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json(threads);
    } catch (err) {
      console.error('Error loading threads:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, slug, category, content, author } = req.body;
      const newThread = await Thread.create({
        title,
        slug,
        category,
        content,
        author,
      });
      return res.status(201).json(newThread);
    } catch (err) {
      console.error('Error creating thread:', err);
      return res.status(500).json({ message: 'Failed to create thread' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}
