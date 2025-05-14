import { connectToDatabase } from '@/lib/mongodb';
import PiCashCode from '@/models/PiCashCode';

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    const now = new Date();
    const code = await PiCashCode.findOne({
      expiresAt: { $gt: now }
    }).sort({ weekStart: -1 });

    if (!code) {
      return res.status(404).json({ error: 'No active code found' });
    }

    return res.status(200).json({
      code: code.code,
      prizePool: code.prizePool,
      expiresAt: new Date(code.expiresAt).toISOString()
    });
  } catch (err) {
    console.error('[API ERROR] /pi-cash-code:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
