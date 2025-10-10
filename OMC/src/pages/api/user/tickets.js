// src/pages/api/user/tickets.js

import { dbConnect } from 'lib/dbConnect';
import Ticket from 'models/Ticket';
import User from 'models/User';
import Entry from 'models/Entry';
import Competition from 'models/Competition';
import TicketCredit from 'models/TicketCredit';

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
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // User ID candidates for cross-collection lookups
    const userPiId = user.piUserId || user.uid;
    const userIdCandidates = [username, userPiId, user._id?.toString?.()].filter(Boolean);

    /* --------------------------- Payments (native collection) --------------------------- */
    const { MongoClient } = require('mongodb');
    const MONGODB_URI = process.env.MONGO_DB_URL;

    let userPayments = [];
    if (MONGODB_URI) {
      try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db();

        const paymentQuery = {
          status: 'completed',
          $or: [
            { 'piUser.uid': userPiId },
            { 'piUser.uid': username },
            { 'piUser.username': username },
          ],
        };
        if (slug) paymentQuery.competitionSlug = slug;

        userPayments = await db.collection('payments').find(paymentQuery).toArray();
        await client.close();
      } catch (paymentError) {
        console.error('Error fetching payments:', paymentError);
        userPayments = [];
      }
    }

    /* --------------------------- Gifted Tickets -------------------------- */
    const giftedQuery = { username };
    if (slug) giftedQuery.competitionSlug = slug;
    const giftedTickets = await Ticket.find(giftedQuery).lean();

    /* ------------------------------ Entries (consumption) ------------------------------ */
    const entryQuery = {
      $or: [
        { userUid: username },
        { userUid: userPiId },
        { username: username },
        { userId: { $in: userIdCandidates } },
      ],
    };
    if (slug) {
      entryQuery.$or = entryQuery.$or.map((q) => ({ ...q, competitionSlug: slug }));
      entryQuery.$or.push({ competitionId: slug });
    }
    const userEntries = await Entry.find(entryQuery).lean();

    /* ------------------------ Admin Grants ------------------------- */
    const creditMatch = { userId: { $in: userIdCandidates } };
    if (slug) creditMatch.competitionSlug = slug;

    const credits = await TicketCredit.find(creditMatch).lean();
    const adminGrants = credits.filter((c) => c.source === 'admin-grant');

    /* ------------------------ Competitions for display -------------------------- */
    const competitionIds = [
      ...new Set([
        ...giftedTickets.map((t) => t.competitionId).filter(Boolean),
        ...userEntries.map((e) => e.competitionId).filter(Boolean),
      ]),
    ];
    const competitionSlugs = [
      ...new Set([
        ...userPayments.map((p) => p.competitionSlug).filter(Boolean),
        ...credits.map((c) => c.competitionSlug).filter(Boolean),
      ]),
    ];

    const competitions = await Competition.find({
      $or: [
        { _id: { $in: competitionIds } },
        { 'comp.slug': { $in: competitionSlugs } },
      ],
    }).lean();

    const competitionMap = competitions.reduce((acc, comp) => {
      acc[comp._id?.toString?.()] = comp;
      if (comp?.comp?.slug) acc[comp.comp.slug] = comp;
      return acc;
    }, {});

    /* ------------------------------- SUMMARY MODE --------------------------------------- */
    if (wantSummary) {
      const paymentsCount = userPayments.reduce((sum, p) => sum + (Number(p.ticketQuantity) || 1), 0);
      const giftCount = giftedTickets.reduce((sum, t) => sum + (Number(t.quantity) || 1), 0);
      const adminCount = adminGrants.reduce((sum, g) => sum + (Number(g.quantity) || 1), 0);
      const voucherCount = credits
        .filter((c) => c.source === 'voucher')
        .reduce((s, c) => s + (Number(c.quantity) || 1), 0);

      const totalCredits = paymentsCount + giftCount + adminCount + voucherCount;
      const used = userEntries.reduce((sum, e) => sum + (Number(e.quantity || e.ticketCount) || 1), 0);
      const available = Math.max(0, totalCredits - used);

      const payload = {
        ok: true,
        user: { username, userPiId },
        slug: slug || null,
        breakdown: {
          payments: paymentsCount,
          gifted: giftCount,
          admin: adminCount,
          vouchers: voucherCount,
          used,
        },
        totalCredits,
        available,
      };

      console.log(`✅ Totals for ${username}${slug ? ` [${slug}]` : ''}:`, payload.breakdown, {
        total: totalCredits,
        available,
      });

      return res.status(200).json(payload);
    }

    /* ------------------------------ LIST MODE --------------------------------- */
    const paymentItems = userPayments.map((payment) => {
      const comp = competitionMap[payment.competitionSlug];

      const ticketNumbers = Array.isArray(payment.ticketNumbers)
        ? payment.ticketNumbers
        : payment.ticketNumber?.toString().includes('-')
          ? (() => {
              const [start, end] = payment.ticketNumber.split('-').map((n) => parseInt(n));
              return Array.from({ length: end - start + 1 }, (_, i) => `T${start + i}`);
            })()
          : payment.ticketNumber
            ? [`T${payment.ticketNumber}`]
            : [`P${String(payment.paymentId || payment._id).slice(-6)}`];

      return {
        competitionTitle: comp?.title || payment.competitionSlug || 'Competition',
        competitionSlug: payment.competitionSlug,
        prize: comp?.prize || 'Prize',
        entryFee: comp?.comp?.entryFee || payment.amount || 0,
        quantity: payment.ticketQuantity || 1,
        drawDate: comp?.comp?.endsAt || payment.completedAt,
        endsAt: comp?.comp?.endsAt || payment.completedAt,
        ticketNumbers,
        imageUrl: comp?.imageUrl || '/images/default-prize.png',
        gifted: false,
        giftedBy: null,
        earned: false,
        purchasedAt: payment.completedAt || payment.createdAt,
        paymentId: payment.paymentId,
        piTransaction: payment.txid,
        theme: comp?.theme || comp?.comp?.theme || 'daily',
        source: 'payment',
      };
    });

    const giftItems = giftedTickets.map((ticket) => {
      const comp = competitionMap[ticket.competitionId?.toString()];
      return {
        competitionTitle: ticket.competitionTitle || comp?.title || 'Unknown Competition',
        competitionSlug: ticket.competitionSlug || comp?.comp?.slug,
        prize: comp?.prize || ticket.competitionTitle || 'Prize',
        entryFee: 0,
        quantity: ticket.quantity || 1,
        drawDate: comp?.comp?.endsAt || ticket.purchasedAt,
        endsAt: comp?.comp?.endsAt || ticket.purchasedAt,
        ticketNumbers: ticket.ticketNumbers || [],
        imageUrl: comp?.imageUrl || ticket.imageUrl || '/images/default-prize.png',
        gifted: true,
        giftedBy: ticket.giftedBy,
        earned: false,
        purchasedAt: ticket.purchasedAt,
        theme: comp?.theme || comp?.comp?.theme || 'daily',
        source: 'gift',
      };
    });

    const entryItems = userEntries.map((entry) => {
      const comp = competitionMap[entry.competitionId?.toString()];
      return {
        competitionTitle: comp?.title || entry.competitionName || 'Unknown Competition',
        competitionSlug: comp?.comp?.slug || entry.competitionId,
        prize: comp?.prize || entry.competitionName || 'Prize',
        entryFee: comp?.comp?.entryFee || 0,
        quantity: entry.quantity || entry.ticketCount || 1,
        drawDate: comp?.comp?.endsAt || entry.createdAt,
        endsAt: comp?.comp?.endsAt || entry.createdAt,
        ticketNumbers: entry.ticketNumbers || [`E${entry._id.toString().slice(-6)}`],
        imageUrl: comp?.imageUrl || '/images/default-prize.png',
        gifted: false,
        giftedBy: null,
        earned: entry.earned || comp?.comp?.entryFee === 0 || false,
        purchasedAt: entry.createdAt,
        theme: comp?.theme || comp?.comp?.theme || 'daily',
        source: 'entry',
      };
    });

    const adminGrantItems = adminGrants.map((grant) => {
      const comp = competitionMap[grant.competitionSlug];
      return {
        competitionTitle: comp?.title || grant.competitionSlug || 'Competition',
        competitionSlug: grant.competitionSlug,
        prize: comp?.prize || 'Prize',
        entryFee: comp?.comp?.entryFee || 0,
        quantity: grant.quantity || 1,
        drawDate: comp?.comp?.endsAt || grant.createdAt,
        endsAt: comp?.comp?.endsAt || grant.createdAt,
        ticketNumbers: grant.code ? [`AG-${grant.code}`] : [`AG${String(grant._id).slice(-6)}`],
        imageUrl: comp?.imageUrl || '/images/default-prize.png',
        gifted: false,
        giftedBy: grant.grantedBy || 'admin',
        earned: true,
        purchasedAt: grant.createdAt,
        theme: comp?.theme || comp?.comp?.theme || 'daily',
        source: 'admin-grant',
      };
    });

    const allTickets = [...paymentItems, ...giftItems, ...adminGrantItems, ...entryItems];

    const uniqueTickets = allTickets.filter((ticket, index, self) => {
      if (ticket.paymentId) {
        return self.findIndex((t) => t.paymentId === ticket.paymentId) === index;
      } else if (ticket.ticketNumbers?.length > 0) {
        return self.findIndex(
          (t) => JSON.stringify(t.ticketNumbers) === JSON.stringify(ticket.ticketNumbers),
        ) === index;
      }
      return true;
    });

    uniqueTickets.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

    const paymentsQty = paymentItems.reduce((s, i) => s + (i.quantity || 1), 0);
    const giftsQty = giftItems.reduce((s, i) => s + (i.quantity || 1), 0);
    const adminQty = adminGrantItems.reduce((s, i) => s + (i.quantity || 1), 0);
    const entriesQty = entryItems.reduce((s, i) => s + (i.quantity || 1), 0);
    const totalCredits = paymentsQty + giftsQty + adminQty;
    const available = Math.max(0, totalCredits - entriesQty);

    console.log(`✅ Found ${uniqueTickets.length} items for user ${username}:`, {
      gifted: giftsQty,
      adminGrants: adminQty,
      entriesUsed: entriesQty,
      payments: paymentsQty,
      creditsTotal: totalCredits,
      available,
    });

    res.setHeader('X-Tickets-Available', String(available));
    res.setHeader('X-Tickets-Credits-Total', String(totalCredits));

    return res.status(200).json(uniqueTickets);
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
}
