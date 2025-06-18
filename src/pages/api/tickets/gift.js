// /pages/api/tickets/gift.js
import dbConnect from 'lib/dbConnect';
import Ticket from 'models/Ticket';

const recentGifts = new Map(); // Basic IP rate limiting

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { recipient, slug, title, imageUrl, quantity = 1 } = req.body;
  const sender = req.headers['x-sender'] || 'guest';

  if (!recipient || !slug || !title) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (sender === recipient) {
    return res.status(400).json({ error: '❌ You cannot gift a ticket to yourself.' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  // ⏱️ 1 gift per 15s per IP
  if (recentGifts.has(ip) && now - recentGifts.get(ip) < 15000) {
    return res.status(429).json({ error: '⏳ Slow down — try gifting again in a few seconds.' });
  }
  recentGifts.set(ip, now);

  try {
    await dbConnect();

    const ticketNumbers = Array.from({ length: quantity }, () =>
      `GFT-${Math.floor(Math.random() * 1000000)}`
    );

    const newTicket = new Ticket({
      username: recipient,
      competitionSlug: slug,
      competitionTitle: title,
      imageUrl,
      quantity,
      ticketNumbers,
      gifted: true,
      giftedBy: sender,
      purchasedAt: new Date(),
    });

    await newTicket.save();

    return res.status(200).json({ success: true, ticket: newTicket });
  } catch (err) {
    console.error('❌ Gift Ticket Error:', err);
    return res.status(500).json({ error: 'Server error while gifting ticket.' });
  }
}
