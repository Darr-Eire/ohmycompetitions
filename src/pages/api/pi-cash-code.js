import { dbConnect } from 'lib/dbConnect';

import mongoose from 'mongoose'; // required if you're using types or ObjectId later
import PiCashCode from '../../models/PiCashCode'; // ✅ Already defined schema

export default async function handler(req, res) {
  await dbConnect();

  try {
    const latestCode = await PiCashCode.findOne().sort({ createdAt: -1 });
    res.status(200).json(latestCode);
  } catch (err) {
    console.error('❌ PiCashCode fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch Pi Cash Code' });
  }
}
