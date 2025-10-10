// src/pages/api/tickets/create-from-payment.js
import { dbConnect } from '../../../lib/dbConnect';
import Ticket from '../../../models/Ticket';
import Competition from '../../../models/Competition';
import User from '../../../models/User';
import { getRandomQuestion, isCorrectAnswer } from '../../../data/skill-questions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { 
      paymentId, 
      username, 
      competitionSlug, 
      ticketQuantity = 1,
      skillQuestionData 
    } = req.body;

    if (!paymentId || !username || !competitionSlug) {
      return res.status(400).json({ 
        message: 'Missing required fields: paymentId, username, competitionSlug' 
      });
    }

    // Get competition details
    const competition = await Competition.findOne({ 'comp.slug': competitionSlug });
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Enforce per-user ticket cap
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const compCap = Number(competition.comp?.maxPerUser || 0);
    const userDefaultCap = Number(user.maxTicketsDefault || 0);
    const overrideMap = user.maxTicketsOverrides || new Map();
    const overrideCap = typeof overrideMap.get === 'function'
      ? overrideMap.get(String(competition._id))
      : (overrideMap[competition._id?.toString()] || null);
    const effectiveCap = overrideCap || compCap || userDefaultCap || 0;

    if (effectiveCap > 0) {
      const currentCount = await Ticket.countDocuments({ username, competitionSlug });
      if (currentCount + Number(ticketQuantity) > effectiveCap) {
        return res.status(400).json({ 
          message: `Ticket limit reached. Max ${effectiveCap} for this competition. You currently have ${currentCount}.`
        });
      }
    }

    // Generate skill question if not provided
    let questionData = skillQuestionData;
    if (!questionData) {
      const randomQuestion = getRandomQuestion();
      questionData = {
        questionId: randomQuestion.id,
        question: randomQuestion.question,
        answers: randomQuestion.answers,
        correctAnswer: randomQuestion.answers[0], // First answer is usually correct
        userAnswer: '', // Will be filled when user answers
        isCorrect: false,
        difficulty: randomQuestion.difficulty,
        tags: randomQuestion.tags
      };
    }

    // Create tickets for this payment
    const tickets = [];
    for (let i = 0; i < ticketQuantity; i++) {
      const ticket = new Ticket({
        username,
        competitionSlug,
        competitionId: competition._id,
        competitionTitle: competition.title,
        imageUrl: competition.imageUrl,
        quantity: 1,
        ticketNumbers: [`T${Date.now()}-${i}`], // Generate unique ticket numbers
        purchasedAt: new Date(),
        gifted: false,
        giftedBy: null,
        skillQuestion: {
          ...questionData,
          attemptedAt: new Date()
        }
      });

      await ticket.save();
      tickets.push(ticket);
    }

    // Optional: Issue stage ticket(s) for Stage 1 purchases → advance to Stage 2
    try {
      const slug = competition.comp?.slug || competitionSlug;
      const looksLikeStage1 = /(^stage-?1[-_]|\bstage\s*1\b)/i.test(String(slug)) || /\bstage\s*1\b/i.test(String(competition.title || ''));
      if (looksLikeStage1) {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/stages/issue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, stage: 2, count: Number(ticketQuantity) || 1, source: 'payment' })
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Stage issuance skipped:', e?.message || e);
    }

    res.status(201).json({
      success: true,
      message: 'Tickets created successfully',
      tickets: tickets.map(ticket => ({
        id: ticket._id,
        ticketNumbers: ticket.ticketNumbers,
        skillQuestion: ticket.skillQuestion
      })),
      paymentId,
      competitionSlug
    });

  } catch (error) {
    console.error('Error creating tickets from payment:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

