// pages/api/claim-code.js
import { connectToDatabase } from 'lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { input, userId } = req.body;

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    const active = await db.collection('pi_cash_codes').findOne({
      'winner.userId': userId,
      claimed: false,
    });

    if (!active) {
      return res.status(400).json({
        success: false,
        message: 'Not eligible or already claimed',
      });
    }

    const now = new Date();
    if (now > new Date(active.claimExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'Claim window expired ⌛',
      });
    }

    if (input?.trim().toUpperCase() !== active.code) {
      return res.status(400).json({
        success: false,
        message: 'Wrong code ❌',
      });
    }

    await db.collection('pi_cash_codes').updateOne(
      { _id: active._id },
      { $set: { claimed: true } }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[ERROR] /api/claim-code:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
