// src/pages/api/user/xp/spend.js
import { dbConnect } from 'lib/dbConnect';
import mongoose from 'mongoose';
import User from 'models/User';
import Ticket from 'models/Ticket';
import Competition from 'models/Competition';

/**
 * Spend XP to mint competition tickets.
 * Accept either:
 *  A) { username, competitionSlug, quantity? }
 *  B) { userId, competitionId | slug, quantity? }
 */
export default async function handler(req, res) {
  // CORS (simple)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      username,
      competitionSlug,
      userId,
      competitionId,
      slug,
      quantity = 1,
    } = req.body || {};

    // ---- Resolve user ----
    let user = null;
    if (username) {
      user = await User.findOne({ username });
    } else if (userId) {
      user =
        (await User.findOne({ uid: userId })) ||
        (await User.findOne({ piUserId: userId })) ||
        (await User.findOne({ username: userId })) ||
        (mongoose.isValidObjectId(userId) ? await User.findById(userId) : null);
    }
    if (!user) return res.status(404).json({ error: 'User not found' });

    // ---- Resolve competition ----
    let comp = null;
    if (competitionSlug) {
      comp = await Competition.findOne({ 'comp.slug': competitionSlug }).lean();
    } else if (competitionId) {
      comp = await Competition.findById(competitionId).lean();
    } else if (slug) {
      comp = await Competition.findOne({ 'comp.slug': slug }).lean();
    }
    if (!comp) return res.status(404).json({ error: 'Competition not found' });

    if (comp.comp?.status !== 'active') {
      return res.status(400).json({ error: 'Competition is not active' });
    }

    const qty = Math.max(1, Number(quantity) || 1);

    // XP pricing (fallback to 100 if unspecified)
    const XP_PER_TICKET = Number(comp?.comp?.xpPerTicket ?? 100);
    if (!Number.isFinite(XP_PER_TICKET) || XP_PER_TICKET <= 0) {
      return res.status(400).json({ error: 'Competition does not accept XP' });
    }
    const totalXp = XP_PER_TICKET * qty;

    // Level requirement example (optional)
    const userXP = user?.xp ?? 0;
    if (userXP < totalXp) {
      return res.status(400).json({ error: 'Not enough XP' });
    }

    // Atomic deduction + ticket mint
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const refreshed = await User.findOneAndUpdate(
        { _id: user._id, xp: { $gte: totalXp } },
        { $inc: { xp: -totalXp } },
        { new: true, session }
      );
      if (!refreshed) throw new Error('XP changed, please retry');

      const resolvedSlug =
        competitionSlug || slug || comp?.comp?.slug || comp?.slug || String(comp._id);

      const ticketNumbers = Array.from(
        { length: qty },
        (_, i) => `XP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${i + 1}`
      );

      const ticketDoc = new Ticket({
        userId: user.uid || user.piUserId || user.username,
        username: user.username,
        competitionId: comp._id,
        competitionSlug: resolvedSlug,
        competitionTitle: comp.title || comp.comp?.title || 'Competition',
        imageUrl: comp.imageUrl,
        quantity: qty,
        ticketNumbers,
        purchasedAt: new Date(),
        earned: true,
        via: 'xp',
        gifted: false,
        giftedBy: null,
        skillQuestion: {
          questionId: 'xp-spend',
          question: 'XP Spend Entry',
          answers: ['OK'],
          correctAnswer: 'OK',
          userAnswer: 'OK',
          isCorrect: true,
          difficulty: 'info',
          tags: ['xp', 'entry'],
          attemptedAt: new Date(),
        },
      });

      await ticketDoc.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        ok: true,
        xpSpent: totalXp,
        ticketId: ticketDoc._id,
        ticketNumbers,
      });
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
