import { dbConnect } from 'lib/dbConnect';
import PioneerNomination from 'models/PioneerNomination';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Fetch all nominations sorted by votes (highest first)
    const nominations = await PioneerNomination.find()
      .sort({ votes: -1, createdAt: -1 })
      .lean();

    // Transform the data to match what the frontend expects
    const formattedNominations = nominations.map(nom => ({
      nominee: nom.name,
      reason: nom.reason,
      votes: nom.votes || 0,
      createdAt: nom.createdAt
    }));

    return res.status(200).json(formattedNominations);
  } catch (err) {
    console.error('❌ Error fetching nominations:', err);
    return res.status(500).json({ error: 'Failed to fetch nominations' });
  }
} 