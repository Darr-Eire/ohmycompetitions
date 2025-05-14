// pages/api/pi-cash-code.js
import { connectToDatabase } from '@/lib/mongodb';
import PiCashCode from '@/models/PiCashCode';

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    const today = new Date().toISOString().slice(0, 10);
    const code = await PiCashCode.findOne({ weekStart: { $lte: today } }).sort({ weekStart: -1 });

    if (!code) {
      return res.status(404).json({ error: 'No code found' });
    }

    return res.status(200).json(code);
  } catch (err) {
    console.error('[API ERROR] /pi-cash-code:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
