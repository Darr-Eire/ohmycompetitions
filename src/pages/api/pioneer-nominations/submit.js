import dbConnect from 'lib/dbConnect';

import Nomination from 'models/Nomination';

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
    await connectToDatabase();
    const newNomination = await Nomination.create({ name, reason });
    res.status(201).json(newNomination);
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
