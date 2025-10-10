import { dbConnect } from 'lib/dbConnect';
import Thread from 'models/Thread';
// Remove auth temporarily for testing
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  // ✅ TEMPORARILY DISABLED AUTH FOR TESTING
  // const session = await getServerSession(req, res, authOptions);
  // if (!session || !session.user?.id) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const { title, content, category, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Missing title or content' });
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    // Save thread to database
    const newThread = await Thread.create({
      slug: `${slug}-${Date.now()}`, // Make slug unique with timestamp
      title,
      body: content,
      category: category || 'general',
      author: author || 'anonymous',
    });

    console.log('✅ Thread created successfully:', newThread.title);

    return res.status(201).json({ 
      message: 'Thread created successfully',
      thread: newThread 
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
