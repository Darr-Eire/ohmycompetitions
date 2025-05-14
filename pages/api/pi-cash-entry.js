// pages/api/pi-cash-entry.js
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { txid, userId, week } = req.body;

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    const codeDoc = await db.collection('pi_cash_codes').findOne({
      weekStart: new Date(week + 'T15:14:00Z'),
    });

    if (!codeDoc) {
      return res.status(404).json({ error: 'Code week not found' });
    }

    await db.collection('pi_cash_entries').insertOne({
      userId,
      txid,
      codeId: codeDoc._id,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[ERROR] /api/pi-cash-entry:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
