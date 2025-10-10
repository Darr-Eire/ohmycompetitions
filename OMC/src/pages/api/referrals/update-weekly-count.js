import { dbConnect } from 'lib/dbConnect';
import User from 'models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const { referrerCode } = req.body;
    if (!referrerCode) return res.status(400).json({ error: 'referrerCode required' });

    // Find referrer and increment weekly count
    const result = await User.updateOne(
      { referralCode: referrerCode },
      { $inc: { referralWeeklyCount: 1, referralCount: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Referrer not found' });
    }

    res.status(200).json({ ok: true, message: 'Weekly count updated' });

  } catch (error) {
    console.error('Update weekly count error:', error);
    res.status(500).json({ error: 'Failed to update weekly count' });
  }
}
