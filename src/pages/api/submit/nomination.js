import { dbConnect } from 'lib/dbConnect';
import PioneerNomination from 'models/PioneerNomination';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nominee, reason } = req.body;
  
  if (!nominee || !reason) {
    return res.status(400).json({ error: 'Name and reason are required' });
  }

  // Basic spam protection
  if (nominee.length > 100 || reason.length > 500) {
    return res.status(400).json({ error: 'Input too long' });
  }

  try {
    await dbConnect();

    // Check if this person is already nominated
    const existing = await PioneerNomination.findOne({ name: nominee });
    if (existing) {
      return res.status(409).json({ error: 'This Pioneer has already been nominated.' });
    }

    const newNomination = new PioneerNomination({
      name: nominee,
      reason,
      votes: 0,
      createdAt: new Date(),
    });

    await newNomination.save();

    return res.status(201).json({ 
      message: 'Nomination submitted successfully', 
      nomination: newNomination 
    });
  } catch (err) {
    console.error('❌ Nomination submission error:', err);
    return res.status(500).json({ error: 'Failed to submit nomination' });
  }
} 