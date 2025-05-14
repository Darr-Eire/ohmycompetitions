import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    const data = await db
      .collection('pi_cash_codes')
      .find({ claimed: true, winner: { $ne: null } })
      .toArray();

    res.status(200).json(data);
  } catch (err) {
    console.error('Error in claimed-winners API:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
