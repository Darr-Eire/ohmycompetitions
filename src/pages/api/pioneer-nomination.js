// src/pages/api/pioneer-nomination.js

import dbConnect from 'lib/dbConnect';

import PioneerNomination from 'models/PioneerNomination';

export default async function handler(req, res) {
  await connectToDatabase();
  const { method } = req;

  switch (method) {
    case 'POST': {
      const { name, reason, action } = req.body;

      if (!name || (action !== 'vote' && !reason)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        if (action === 'vote') {
          const nominee = await PioneerNomination.findOne({ name });
          if (!nominee) return res.status(404).json({ error: 'Nominee not found' });

          nominee.votes += 1;
          await nominee.save();

          return res.status(200).json({ message: 'Vote recorded', nominee });
        }

        // Prevent duplicate nominations
        const existing = await PioneerNomination.findOne({ name });
        if (existing) {
          return res.status(409).json({ error: 'This Pioneer has already been nominated.' });
        }

        const newNomination = new PioneerNomination({
          name,
          reason,
          votes: 0,
          createdAt: new Date(),
        });

        await newNomination.save();

        return res.status(201).json({ message: 'Nomination submitted', newNomination });
      } catch (err) {
        console.error('[❌] Nomination API Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    case 'GET': {
      try {
        const nominations = await PioneerNomination.find().sort({ votes: -1 }).lean();
        return res.status(200).json(nominations);
      } catch (err) {
        console.error('[❌] Fetch nominations failed:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
