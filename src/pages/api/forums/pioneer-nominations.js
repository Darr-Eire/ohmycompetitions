import { dbConnect } from 'lib/dbConnect';

import PioneerNomination from 'models/PioneerNomination';



export default async function handler(req, res) {
  await connectToDatabase();

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
      const saved = await PioneerNomination.create({ name, reason });
      return res.status(201).json({ success: true, nomination: saved });
    } catch (err) {
      console.error('Nomination Error:', err);
      return res.status(500).json({ error: 'Failed to save nomination' });
    }
  }

  if (req.method === 'GET') {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const nominations = await PioneerNomination.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(nominations);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
