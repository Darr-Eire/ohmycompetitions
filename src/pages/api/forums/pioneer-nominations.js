import { dbConnect } from 'lib/dbConnect';
import PioneerNomination from 'models/PioneerNomination';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { name, reason } = req.body;

    if (!name || !reason) {
      return res.status(400).json({ error: 'Name and reason required' });
    }

    // Simple spam protection
    if (reason.length > 1000) {
      return res.status(400).json({ error: 'Reason too long' });
    }

    try {
      // Check for duplicate nominations
      const existing = await PioneerNomination.findOne({ name });
      if (existing) {
        return res.status(409).json({ error: 'This Pioneer has already been nominated.' });
      }

      const saved = await PioneerNomination.create({ 
        name, 
        reason,
        votes: 0
      });
      return res.status(201).json({ success: true, nomination: saved });
    } catch (err) {
      console.error('Nomination Error:', err);
      return res.status(500).json({ error: 'Failed to save nomination' });
    }
  }

  if (req.method === 'GET') {
    try {
      const nominations = await PioneerNomination.find().sort({ createdAt: -1 }).limit(50);
      return res.status(200).json(nominations);
    } catch (err) {
      console.error('Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch nominations' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
