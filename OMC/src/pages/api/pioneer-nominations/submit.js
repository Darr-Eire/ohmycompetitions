import { dbConnect } from 'lib/dbConnect';
import PioneerNomination from 'models/PioneerNomination';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { name, reason } = req.body;
  if (!name || !reason) {
    return res.status(400).json({ error: 'Missing name or reason' });
  }

  // ✅ Optional: Basic spam prevention — limit name length and reason length
  if (name.length > 100 || reason.length > 500) {
    return res.status(400).json({ error: 'Input too long' });
  }

  try {
    await dbConnect();
    
    // Check for duplicate nominations
    const existing = await PioneerNomination.findOne({ name });
    if (existing) {
      return res.status(409).json({ error: 'This Pioneer has already been nominated.' });
    }

    const newNomination = await PioneerNomination.create({ 
      name, 
      reason,
      votes: 0
    });
    res.status(201).json(newNomination);
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
