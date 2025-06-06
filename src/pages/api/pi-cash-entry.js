// src/pages/api/pi-cash-entry.js

import { connectToDatabase } from 'lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { txid, userId, week } = req.body;

  if (!txid || !userId || !week) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    const weekStartDate = new Date(`${week}T00:00:00Z`);
    const codeDoc = await db.collection('pi_cash_codes').findOne({
      weekStart: weekStartDate,
    });

    if (!codeDoc) {
      return res.status(404).json({ error: 'Code week not found' });
    }

    // Prevent duplicate txid entries (important for safety)
    const duplicate = await db.collection('pi_cash_entries').findOne({ txid });
    if (duplicate) {
      return res.status(409).json({ error: 'Duplicate transaction ID' });
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
    return res.status(500).json({ error: 'Internal server error' });
  }
}
