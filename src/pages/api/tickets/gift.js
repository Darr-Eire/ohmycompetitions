// src/pages/api/tickets/gift.js
import { dbConnect } from 'lib/dbConnect';
import Ticket from 'models/Ticket';
import User from 'models/User';
import Competition from 'models/Competition';
import { verifyPayment } from 'lib/pi/verifyPayment'; // ensure this exists

// Simple in-memory IP limiter
const recentGifts = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  const {
    fromUsername,
    toUsername,
    competitionSlug,
    competitionId,
    quantity = 1,
    paymentId,
    transaction,
  } = req.body || {};

  if (!fromUsername || !toUsername || (!competitionSlug && !competitionId)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (fromUsername.toLowerCase() === toUsername.toLowerCase()) {
    return res.status(400).json({ error: 'You cannot gift a ticket to yourself' });
  }

  if (quantity < 1 || quantity > 50) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 50' });
  }

  // Safer IP detection
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown';
  const now = Date.now();

  if (recentGifts.has(ip) && now - recentGifts.get(ip) < 15_000) {
    return res.status(429).json({ error: 'Please wait 15 seconds between gifts' });
  }

  try {
    console.log('🎁 Gift ticket request:', {
      fromUsername,
      toUsername,
      competitionId,
      quantity,
    });

    const sender = await User.findOne({
      username: { $regex: new RegExp(`^${fromUsername}$`, 'i') },
    }).lean();
    if (!sender) return res.status(404).json({ error: 'Sender not found' });

    const recipient = await User.findOne({
      username: { $regex: new RegExp(`^${toUsername}$`, 'i') },
    }).lean();
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    let competition;
    if (competitionId) {
      competition = await Competition.findById(competitionId).lean();
    } else {
      competition = await Competition.findOne({ 'comp.slug': competitionSlug }).lean();
    }
    if (!competition) return res.status(404).json({ error: 'Competition not found' });

    if (competition.comp?.status !== 'active') {
      return res.status(400).json({ error: 'Competition is not active' });
    }

    const entryFee = competition.comp?.entryFee || 0;
    const expectedAmount = quantity * entryFee;

    if (!paymentId || !transaction) {
      return res.status(400).json({ error: 'Missing payment data' });
    }

    const isValidPayment = await verifyPayment({
      paymentId,
      transaction,
      expectedAmount,
      username: fromUsername,
      reason: 'gift',
    });

    if (!isValidPayment) {
      return res.status(402).json({ error: 'Pi payment verification failed' });
    }

    // Generate gift ticket numbers
    const ticketNumbers = Array.from({ length: quantity }, (_, i) =>
      `GIFT-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i + 1}`
    );

    const giftTicket = new Ticket({
      username: recipient.username,
      competitionSlug: competition.comp?.slug || competitionSlug,
      competitionId: competition._id,
      competitionTitle: competition.title,
      imageUrl: competition.imageUrl || competition.thumbnail || '/images/default-prize.png',
      quantity: parseInt(quantity, 10),
      ticketNumbers,
      gifted: true,
      giftedBy: sender.username,
      purchasedAt: new Date(),
      payment: {
        paymentId,
        transactionId: transaction.identifier || transaction.txid || null,
        amount: expectedAmount,
        type: 'gift',
      },
    });

    await giftTicket.save();

    recentGifts.set(ip, now);

    console.log(
      `✅ Gift ticket sent: ${fromUsername} → ${toUsername} for ${competition.title}`
    );

    return res.status(200).json({
      success: true,
      ticket: {
        id: giftTicket._id,
        competitionTitle: competition.title,
        quantity,
        recipient: recipient.username,
        ticketNumbers,
      },
    });
  } catch (error) {
    console.error('❌ Gift Ticket Error:', error);
    return res.status(500).json({ error: 'Server error while gifting ticket' });
  }
}
