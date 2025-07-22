// /pages/api/competitions/results.js
import dbConnect from '../../../lib/dbConnect';

import Competition from '../../../models/Competition';


export default async function handler(req, res) {
  await dbConnect();

  try {
    const competitions = await Competition.find({ status: 'completed' })
      .sort({ endsAt: -1 })
      .limit(100)
      .lean();

    const results = competitions.map(comp => ({
      id: comp._id,
      title: comp.title,
      prize: comp.prize,
      endsAt: comp.endsAt,
      imageUrl: comp.imageUrl,
      winners: comp.winners || [], // assuming [{ username, ticketId }]
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error('Failed to load competition results:', error);
    res.status(500).json({ error: 'Failed to load competition results.' });
  }
}
