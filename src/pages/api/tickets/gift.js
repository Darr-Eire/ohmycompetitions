// /pages/api/tickets/gift.js
import { dbConnect } from 'lib/dbConnect';
import Ticket from 'models/Ticket';
import User from 'models/User';
import Competition from 'models/Competition';

const recentGifts = new Map(); // Basic IP rate limiting

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
    quantity = 1 
  } = req.body;

  // Validate required fields
  if (!fromUsername || !toUsername || (!competitionSlug && !competitionId)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Prevent self-gifting
  if (fromUsername.toLowerCase() === toUsername.toLowerCase()) {
    return res.status(400).json({ error: 'You cannot gift a ticket to yourself' });
  }

  // Validate quantity
  if (quantity < 1 || quantity > 50) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 50' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();

  if (recentGifts.has(ip) && now - recentGifts.get(ip) < 15000) {
    return res.status(429).json({ error: 'Please wait 15 seconds between gifts' });
  }

  try {
    console.log('Gift ticket request:', { fromUsername, toUsername, competitionId, quantity });
    
    // Verify sender exists
    const sender = await User.findOne({ 
      username: { $regex: new RegExp(`^${fromUsername}$`, 'i') }
    }).lean();
    
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
  }

    // Verify recipient exists
    const recipient = await User.findOne({ 
      username: { $regex: new RegExp(`^${toUsername}$`, 'i') }
    }).lean();
    
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Get competition details
    let competition;
    if (competitionId) {
      competition = await Competition.findById(competitionId).lean();
    } else {
      competition = await Competition.findOne({ 'comp.slug': competitionSlug }).lean();
    }

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    // Check if competition is active
    if (competition.comp?.status !== 'active') {
      return res.status(400).json({ error: 'Competition is not active' });
    }

    // Generate unique ticket numbers
    const ticketNumbers = Array.from({ length: quantity }, (_, i) => 
      `GIFT-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i + 1}`
    );

    // Create gift ticket
    const giftTicket = new Ticket({
      username: recipient.username,
      competitionSlug: competition.comp?.slug || competitionSlug,
      competitionId: competition._id,
      competitionTitle: competition.title,
      imageUrl: competition.imageUrl || competition.thumbnail || '/images/default-prize.png',
      quantity: parseInt(quantity),
      ticketNumbers,
      gifted: true,
      giftedBy: sender.username,
      purchasedAt: new Date(),
    });

    await giftTicket.save();

    // Update rate limiting
    recentGifts.set(ip, now);

    console.log(`✅ Gift ticket created: ${sender.username} → ${recipient.username} (${competition.title})`);

    return res.status(200).json({ 
      success: true, 
      ticket: {
        id: giftTicket._id,
        competitionTitle: competition.title,
        quantity: quantity,
        recipient: recipient.username,
        ticketNumbers: ticketNumbers
      }
    });

  } catch (error) {
    console.error('❌ Gift Ticket Error:', error);
    return res.status(500).json({ error: 'Server error while gifting ticket' });
  }
}
