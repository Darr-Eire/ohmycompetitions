// src/pages/api/claimed-winners.js
import { connectToDatabase } from 'lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    const data = await db
      .collection('pi_cash_codes')
      .find({ claimed: true, winner: { $ne: null } })
      .sort({ claimedAt: -1 }) // latest claims first (optional but nice touch)
      .limit(100) // limit to avoid abuse / huge payloads
      .toArray();

    res.status(200).json(data);
  } catch (err) {
    console.error('[ERROR] /api/claimed-winners:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
