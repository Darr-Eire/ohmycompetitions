import { connectToDatabase } from 'lib/mongodb';
import Discussion from 'models/Discussion';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Missing title or content' });
  }

  try {
    await connectToDatabase();
    const saved = await Discussion.create({ title, content });
    res.status(200).json({ message: 'Discussion saved', data: saved });
  } catch (error) {
    console.error('❌ MongoDB Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
