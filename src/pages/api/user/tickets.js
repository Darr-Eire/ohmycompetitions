// src/pages/api/user/tickets.js
import { dbConnect } from 'lib/dbConnect';
import Ticket from 'models/Ticket';
import Competition from 'models/Competition';
import User from 'models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await dbConnect();

  const { username, slug, summary, mode } = req.query;
  const wantSummary = summary === '1' || (mode && mode.toLowerCase() === 'summary');

  if (!username) {
    return res.status(400).json({ message: 'Missing username parameter' });
  }

  try {
    // 1) Make sure user exists
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2) Fetch Ticket docs only (stable core)
    const ticketQuery = { username };
    if (slug) ticketQuery.competitionSlug = slug;

    const tickets = await Ticket.find(ticketQuery).lean();

    // 3) Prefetch competitions used for pretty labels
    const compIds = [...new Set(tickets.map(t => t.competitionId).filter(Boolean))];
    const comps = await Competition.find({ _id: { $in: compIds } }).lean();
    const compMap = comps.reduce((acc, c) => {
      acc[String(c._id)] = c;
      if (c?.comp?.slug) acc[c.comp.slug] = c;
      return acc;
    }, {});

    // 4) SUMMARY mode (credits = sum of Ticket.quantity)
    if (wantSummary) {
      const purchasedOrGifted = tickets.reduce((s, t) => s + (Number(t.quantity) || 1), 0);
      // entries not counted here in the minimal version; available == total
      const payload = {
        ok: true,
        user: { username, userPiId: user.piUserId || user.uid || null },
        slug: slug || null,
        breakdown: {
          payments: 0,   // not counting native payments in this minimal version
          purchased: purchasedOrGifted,
          gifted: 0,     // you can split on t.gifted later if you want
          admin: 0,
          vouchers: 0,
          used: 0        // entries omitted in this minimal version
        },
        totalCredits: purchasedOrGifted,
        available: purchasedOrGifted
      };
      return res.status(200).json(payload);
    }

    // 5) LIST mode
    const list = tickets.map(t => {
      const comp = compMap[t.competitionId ? String(t.competitionId) : t.competitionSlug] || null;
      return {
        competitionTitle: t.competitionTitle || comp?.title || 'Competition',
        competitionSlug: t.competitionSlug || comp?.comp?.slug || null,
        prize: comp?.prize || t.competitionTitle || 'Prize',
        entryFee: comp?.comp?.entryFee ?? 0,
        quantity: Number(t.quantity || (Array.isArray(t.ticketNumbers) ? t.ticketNumbers.length : 1)),
        drawDate: comp?.comp?.endsAt || t.purchasedAt,
        endsAt: comp?.comp?.endsAt || t.purchasedAt,
        ticketNumbers: Array.isArray(t.ticketNumbers) ? t.ticketNumbers : [],
        imageUrl: comp?.imageUrl || t.imageUrl || '/images/default-prize.png',
        gifted: !!t.gifted,
        giftedBy: t.giftedBy || null,
        earned: t.source === 'free' || t.source === 'xp' || false,
        purchasedAt: t.purchasedAt,
        paymentId: t.meta?.paymentId || null,
        piTransaction: t.meta?.txidHint || null,
        theme: comp?.theme || comp?.comp?.theme || 'daily',
        source: t.source || (t.gifted ? 'gift' : 'purchase')
      };
    });

    // most recent first
    list.sort((a,b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

    // headers (credits = all items; no entry consumption in this minimal version)
    const totalCredits = list.reduce((s, i) => s + (Number(i.quantity) || 1), 0);
    res.setHeader('X-Tickets-Available', String(totalCredits));
    res.setHeader('X-Tickets-Credits-Total', String(totalCredits));

    return res.status(200).json(list);
  } catch (err) {
    console.error('Error fetching user tickets (minimal):', err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
}
