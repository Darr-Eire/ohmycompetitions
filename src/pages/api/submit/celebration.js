import { connectToDatabase } from 'lib/mongodb';
import Celebration from 'models/Celebration';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, story } = req.body;

  if (!name || !story) {
    return res.status(400).json({ error: 'Missing name or story' });
  }

  try {
    await connectToDatabase();
    const saved = await Celebration.create({ name, story });
    res.status(200).json({ message: 'Celebration saved', data: saved });
  } catch (error) {
    console.error('❌ MongoDB Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
