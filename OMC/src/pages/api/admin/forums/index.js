import { dbConnect } from 'lib/dbConnect';
import Thread from 'models/Thread';
// Remove auth temporarily for testing
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  await dbConnect();

  // ✅ TEMPORARILY DISABLED AUTH FOR TESTING
  // const session = await getServerSession(req, res, authOptions);
  // if (!session || session.user?.role !== 'admin') {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

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
      const { slug, title, body, category, author } = req.body;

      if (!slug || !title || !category) {
        return res.status(400).json({ message: 'Missing fields' });
      }

      const newThread = await Thread.create({
        slug,
        title,
        body,
        category,
        author: author || 'admin',
      });

      return res.status(201).json(newThread);
    } catch (err) {
      console.error('Error creating thread:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'Missing thread ID' });
      }
      
      await Thread.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Thread deleted successfully' });
    } catch (err) {
      console.error('Error deleting thread:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end();
}
