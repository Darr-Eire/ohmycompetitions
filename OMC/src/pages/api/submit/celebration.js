import { dbConnect } from 'lib/dbConnect';
import Thread from 'models/Thread';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content, story } = req.body;

  if (!title || (!content && !story)) {
    return res.status(400).json({ error: 'Missing title or content' });
  }

  try {
    await dbConnect();
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const saved = await Thread.create({ 
      slug: `${slug}-${Date.now()}`,
      title, 
      body: content || story,
      category: 'winners',
      author: 'Anonymous', // TODO: Add proper auth
      createdAt: new Date()
    });

    console.log('✅ Celebration thread created:', saved.title);
    res.status(200).json({ message: 'Celebration saved', data: saved });
  } catch (error) {
    console.error('❌ MongoDB Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
