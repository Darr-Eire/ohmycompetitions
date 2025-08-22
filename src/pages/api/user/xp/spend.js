// src/pages/api/user/xp/spend.js
import { dbConnect } from 'lib/dbConnect';
import Competition from 'models/Competition';
import User from 'models/User';
import Ticket from 'models/Ticket';
import mongoose from 'mongoose';
import { computeXPCost, levelFromXP, deriveSlug } from 'lib/xp';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();

    const { userId, competitionId, slug } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    if (!competitionId && !slug) return res.status(400).json({ error: 'Missing competitionId or slug' });

    const user =
      (await User.findOne({ uid: userId })) ||
      (await User.findOne({ piUserId: userId })) ||
      (await User.findOne({ username: userId }));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const comp = competitionId
      ? await Competition.findById(competitionId).lean()
      : await Competition.findOne({ 'comp.slug': slug }).lean();

    if (!comp) return res.status(404).json({ error: 'Competition not found' });

    // Compute xpCost the same way as offers
    const xpCost = computeXPCost(comp);
    if (xpCost <= 0) return res.status(400).json({ error: 'Competition does not accept XP' });
    const minLevel = levelFromXP(xpCost);

    const userXP = user?.xp ?? 0;
    const userLevel = user?.level ?? 1;
    if (userLevel < minLevel) return res.status(400).json({ error: 'Level too low' });
    if (userXP < xpCost) return res.status(400).json({ error: 'Not enough XP' });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const refreshed = await User.findOneAndUpdate(
        { _id: user._id, xp: { $gte: xpCost } },
        { $inc: { xp: -xpCost } },
        { new: true, session }
      );
      if (!refreshed) throw new Error('XP changed, please retry');

      await Ticket.create(
        [{
          userId: user.uid || user.piUserId || user.username,
          username: user.username,
          competitionId: comp._id,
          competitionSlug: deriveSlug(comp),
          competitionTitle: comp.title || 'Competition',
          quantity: 1,
          earned: true,
          via: 'xp',
          createdAt: new Date()
        }],
        { session }
      );

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ success: true });
    } catch (txErr) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ error: txErr.message || 'Conflict, try again' });
    }
  } catch (err) {
    console.error('❌ /api/user/xp/spend error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
