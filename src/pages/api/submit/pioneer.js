import { dbConnect } from 'lib/dbConnect';
import PioneerNomination from 'models/PioneerNomination';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, reason } = req.body;
  if (!name || !reason) return res.status(400).json({ error: 'Missing fields' });

  try {
    await dbConnect();

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

    res.status(200).json({ message: 'Nomination submitted', data: saved });
  } catch (err) {
    console.error('❌ Pioneer nomination error:', err);
    res.status(500).json({ error: 'Failed to submit nomination' });
  }
}
