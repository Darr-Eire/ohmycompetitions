// src/pages/api/ghost-winners.js

import { connectToDatabase } from 'lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    const data = await db.collection('pi_cash_codes').find({
      winner: { $ne: null },
      claimed: false
    })
    .sort({ drawAt: -1 }) // Sort by latest draws
    .limit(100) // Limit for safety
    .toArray();

    res.status(200).json(data);
  } catch (err) {
    console.error('[ERROR] /api/ghost-winners:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
