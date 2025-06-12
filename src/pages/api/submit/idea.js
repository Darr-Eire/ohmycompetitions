import { connectToDatabase } from 'lib/mongodb';
import Idea from 'models/Idea';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idea, reason } = req.body;

  if (!idea || !reason) {
    return res.status(400).json({ error: 'Missing idea or reason' });
  }

  try {
    await connectToDatabase();
    const saved = await Idea.create({ idea, reason });
    res.status(200).json({ message: 'Idea saved', data: saved });
  } catch (error) {
    console.error('❌ MongoDB Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
