// src/pages/api/admin/tickets/grant.js
import mongoose from 'mongoose';
import { dbConnect } from 'lib/db';               // or 'lib/dbConnect' if that's your file
import Competition from 'models/Competition';
import Ticket from 'models/Ticket';
import User from 'models/User';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    // very light admin check; replace with your real auth
    if (req.headers['x-admin'] !== 'true') {
      return res.status(401).json({ ok: false, error: 'Admin auth required' });
    }

    await dbConnect();

   const { userId, competitionSlug, quantity = 1, reason = 'admin-grant' } = req.body || {};
    if (!userId || !competitionSlug) {
      return res.status(400).json({ ok: false, error: 'userId and competitionSlug required' });
    }
    const qty = Math.max(1, Number(quantity) || 0);

    // Find user by _id OR username OR pi ids
    const or = [{ username: userId }, { piUserId: userId }, { uid: userId }];
    if (mongoose.Types.ObjectId.isValid(userId)) or.push({ _id: userId });
    const user = await User.findOne({ $or: or }).lean();
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    // Atomically reserve tickets and get sequential numbers
    const { updated: comp, ticketNumbers } =
      await Competition.reserveTickets(competitionSlug, qty);

    // Create the credit/grant document – include required fields for your Ticket schema
    const creditDoc = await Ticket.create({
      userId: String(user._id ?? user.uid ?? user.piUserId ?? user.username),
      username: user.username,                       // required by your schema
      competitionId: comp._id,
      competitionSlug,
      competitionTitle: comp.title,                  // required by your schema
      imageUrl: comp.imageUrl,
      quantity: qty,
      source: 'admin-grant',
      reason,
      ticketNumbers,
      purchasedAt: new Date()
    });

    return res.status(200).json({
      ok: true,
      grantId: String(creditDoc._id),
      competitionSlug,
      ticketNumbers,
      ticketsSold: comp.comp.ticketsSold,
      available: (comp.comp.totalTickets ?? 0) - (comp.comp.ticketsSold ?? 0)
    });
  } catch (err) {
    console.error('GRANT ERROR:', err);
    const msg = err?.message || 'Internal Server Error';
    const status = /not enough|not found|invalid/i.test(msg) ? 400 : 500;
    return res.status(status).json({ ok: false, error: msg });
  }
}
