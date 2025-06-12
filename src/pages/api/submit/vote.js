import { connectToDatabase } from 'lib/mongodb';
import Vote from 'models/Vote';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { voteOption, reason } = req.body;

  if (!voteOption || !reason) {
    return res.status(400).json({ error: 'Missing vote option or reason' });
  }

  try {
    await connectToDatabase();
    const saved = await Vote.create({ voteOption, reason });
    res.status(200).json({ message: 'Vote saved', data: saved });
  } catch (error) {
    console.error('❌ MongoDB Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
