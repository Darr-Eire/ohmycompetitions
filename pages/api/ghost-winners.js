import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await connectToDatabase();
  const db = mongoose.connection.db;

  const data = await db.collection('pi_cash_codes').find(...).toArray();

  res.status(200).json(data);
}
