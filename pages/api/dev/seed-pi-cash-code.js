import { connectToDatabase } from 'lib/mongodb';
import PiCashCode from 'models/PiCashCode';

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay()); // last Sunday = start of week

    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 24 hours from now

    const result = await PiCashCode.create({
      code: 'PI314CODE',
      prizePool: 31400,
      weekStart,
      expiresAt
    });

    res.status(200).json({
      success: true,
      insertedId: result._id,
      message: 'Test Pi Cash Code inserted'
    });
  } catch (err) {
    console.error('[SEED ERROR]', err);
    res.status(500).json({ error: 'Failed to insert test code' });
  }
}
