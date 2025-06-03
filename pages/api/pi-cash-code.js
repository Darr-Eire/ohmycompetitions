import { connectToDatabase } from 'lib/mongodb';
import PiCashCode from 'src/models/PiCashCode';

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    const now = new Date();

    // Try to find an active code
    let code = await PiCashCode.findOne({
      expiresAt: { $gt: now }
    }).sort({ weekStart: -1 });

    // Dev fallback: auto-seed if nothing exists
    if (!code && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ No active Pi Cash Code found — auto-creating fallback for development.');

      const expiresAt = new Date(Date.now() + (31 * 60 * 60 + 4 * 60) * 1000); // now + 31h 4m

      code = await PiCashCode.create({
        code: 'DEV314',
        weekStart: new Date(),
        expiresAt,
        prizePool: 31400,
        tickets: []
      });
    }

    if (!code) {
      console.warn('❌ No active Pi Cash Code found and not in development.');
      return res.status(404).json({ error: 'No active code found' });
    }

    // Return full data to frontend for flexibility
    return res.status(200).json({
      code: code.code,
      prizePool: code.prizePool,
      expiresAt: code.expiresAt.toISOString(),
      weekStart: code.weekStart?.toISOString(),
      tickets: code.tickets?.length || 0
    });
  } catch (err) {
    console.error('[API ERROR] /pi-cash-code:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
