import { dbConnect } from '../../../lib/dbConnect';
import Ticket from '../../../models/Ticket';
import Competition from '../../../models/Competition';
import User from '../../../models/User';
import { getQuestionById, isCorrectAnswer } from '../../../data/skill-questions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  try {
    await dbConnect();
    console.log('🎯 [create-from-payment] HIT', req.body?.paymentId, 'uid=', req.body?.userUid);

    const {
      paymentId,                // REQUIRED for idempotency
      userUid,                  // REQUIRED by Ticket schema
      username,                 // display/lookup
      competitionSlug,          // REQUIRED
      ticketQuantity = 1,
      skillQuestionData,        // { questionId, userAnswer }
      imageUrl,                 // optional
      gifted = false,
      giftedBy = null,
    } = req.body || {};

    // ---- Required fields ----
    if (!paymentId || !userUid || !username || !competitionSlug) {
      return res.status(400).json({
        ok: false,
        error: 'missing-required-fields',
        missing: {
          paymentId: !!paymentId,
          userUid: !!userUid,
          username: !!username,
          competitionSlug: !!competitionSlug,
        },
      });
    }

    // ---- Require a skill answer ----
    if (!skillQuestionData?.questionId || !skillQuestionData?.userAnswer) {
      return res.status(400).json({
        ok: false,
        error: 'missing-skill-question',
        detail: 'Provide { questionId, userAnswer }',
      });
    }

    // ---- Idempotency ----
    const already = await Ticket.exists({ 'meta.paymentId': paymentId });
    if (already) {
      console.log('ℹ️ [create-from-payment] already-issued for', paymentId);
      return res.status(200).json({ ok: true, issued: false, reason: 'already-issued' });
    }

    // ---- Competition ----
    const competition = await Competition.findOne({ 'comp.slug': competitionSlug });
    if (!competition) {
      return res.status(404).json({ ok: false, error: 'competition-not-found' });
    }

    // ---- Enforce per-user ticket cap ----
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ ok: false, error: 'user-not-found' });
    }

    const compCap = Number(competition.comp?.maxPerUser || 0);
    const userDefaultCap = Number(user.maxTicketsDefault || 0);
    const overrideMap = user.maxTicketsOverrides || new Map();
    const overrideCap =
      typeof overrideMap.get === 'function'
        ? overrideMap.get(String(competition._id))
        : overrideMap[competition._id?.toString()] || null;
    const effectiveCap = overrideCap || compCap || userDefaultCap || 0;

    if (effectiveCap > 0) {
      const currentCount = await Ticket.countDocuments({ userUid, competitionSlug });
      if (currentCount + Number(ticketQuantity) > effectiveCap) {
        return res.status(400).json({
          ok: false,
          error: 'ticket-cap-reached',
          detail: `Max ${effectiveCap} for this competition. You currently have ${currentCount}.`,
        });
      }
    }

    // ---- Validate skill question server-side ----
    const q = getQuestionById(skillQuestionData.questionId);
    if (!q) {
      return res.status(400).json({ ok: false, error: 'invalid-skill-question' });
    }

    const isCorrect = isCorrectAnswer(q, skillQuestionData.userAnswer);
    if (!isCorrect) {
      return res.status(400).json({ ok: false, error: 'skill-incorrect' });
    }

    // Build required skillQuestion block
    const skillQuestion = {
      questionId: String(q.id),
      question: q.question,
      answers: q.answers,
      correctAnswer: q.answers[0], // first element from SKILL_QUESTIONS list
      userAnswer: String(skillQuestionData.userAnswer),
      isCorrect: true,
      difficulty: q.difficulty || 'easy',
      tags: q.tags || [],
      attemptedAt: new Date(),
    };

    // ---- Reserve ticket numbers atomically ----
    const { updated, ticketNumbers } = await Competition.reserveTickets(
      competitionSlug,
      Number(ticketQuantity)
    );

    // ---- Create Ticket ----
    const ticket = await Ticket.create({
      userUid,
      username,
      competitionSlug,
      competitionId: updated._id,
      competitionTitle: competition.title,
      imageUrl: imageUrl || competition.imageUrl,
      quantity: Number(ticketQuantity),
      ticketNumbers,
      purchasedAt: new Date(),
      gifted,
      giftedBy,
      source: 'purchase',
      meta: { paymentId, piUserUid: userUid },
      skillQuestion,
    });

    console.log('✅ Ticket saved', ticket._id, ticket.ticketNumbers);

    // ---- Optional: stage-advance ----
    try {
      const slug = competition.comp?.slug || competitionSlug;
      const looksLikeStage1 =
        /(^stage-?1[-_]|\bstage\s*1\b)/i.test(String(slug)) ||
        /\bstage\s*1\b/i.test(String(competition.title || ''));
      if (looksLikeStage1) {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/stages/issue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            stage: 2,
            count: Number(ticketQuantity) || 1,
            source: 'payment',
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Stage issuance skipped:', e?.message || e);
    }

    const count = await Ticket.countDocuments({});
    console.log('📊 Ticket count now', count);

    return res.status(201).json({
      ok: true,
      issued: true,
      count: Number(ticketQuantity),
      paymentId,
      competitionSlug,
      tickets: [
        {
          id: ticket._id,
          ticketNumbers: ticket.ticketNumbers,
          skillQuestion: ticket.skillQuestion,
        },
      ],
    });
  } catch (error) {
    console.error('❌ Error creating tickets from payment:', error);
    return res
      .status(500)
      .json({ ok: false, error: error?.message || 'server-error' });
  }
}
