// /src/pages/api/vouchers/redeem.js
export const config = { api: { bodyParser: true } };

import { getDb } from 'lib/db.js';
import Voucher from 'models/Voucher';
import TicketCredit from 'models/TicketCredit';
import Competition from 'models/Competition';
import User from 'models/User';
import { hashCode } from 'lib/vouchers';

// Accept username or userId from client auth context
function getAuthUser(reqBody) {
  const { username, userId } = reqBody || {};
  return { username: username || null, userId: userId || null };
}

// Normalize booleans from true/false/"true"/"1"
function toBool(val) {
  if (val === true || val === false) return val;
  const s = String(val ?? '').toLowerCase();
  return s === 'true' || s === '1';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { code, competitionSlug: overrideSlug, reserve } = req.body || {};
    const wantReserve = toBool(reserve);

    if (!code) return res.status(400).json({ error: 'code required' });

    const { username, userId } = getAuthUser(req.body);
    if (!username && !userId) {
      return res.status(400).json({ error: 'username or userId required' });
    }

    // Resolve a canonical user (optional but recommended)
    let userDoc = null;
    if (username) userDoc = await User.findOne({ username }).lean();
    if (!userDoc && userId) {
      userDoc = await User.findOne({
        $or: [{ uid: userId }, { piUserId: userId }, { id: userId }],
      }).lean();
    }

    const resolvedUserId =
      userDoc?.uid || userDoc?.piUserId || userDoc?._id?.toString() || userId || username;
    const resolvedUsername = userDoc?.username || username || userId;

    // Lookup voucher by hashed code
    const codeHash = hashCode(code);
    const voucher = await Voucher.findOne({ codeHash });
    if (!voucher) return res.status(404).json({ error: 'Invalid code' });

    // Friendly pre-checks (final check will be atomic below)
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Code expired' });
    }
    if (voucher.assignedToUserId && voucher.assignedToUserId !== resolvedUserId) {
      return res.status(403).json({ error: 'This code is not assigned to this user' });
    }

    const totalUsed = voucher.usedCount ?? (voucher.redemptions?.length || 0);
    const maxRedemptions = voucher.maxRedemptions ?? 1;
    if (totalUsed >= maxRedemptions) {
      return res.status(400).json({ error: 'Code fully redeemed' });
    }

    const perUserLimit = voucher.perUserLimit ?? 1;
    const priorUserUses = (voucher.redemptions || []).filter(
      (r) => r.userId === resolvedUserId || r.username === resolvedUsername
    ).length;
    if (priorUserUses >= perUserLimit) {
      return res.status(400).json({ error: 'Per-user redemption limit reached' });
    }

    const competitionSlug = overrideSlug || voucher.competitionSlug;
    if (!competitionSlug) {
      return res.status(400).json({ error: 'Competition missing on voucher' });
    }

    // Optionally reserve inventory (deduct comp.ticketsSold now)
    let reservedTicketNumbers = [];
    if (wantReserve) {
      try {
        const { ticketNumbers } = await Competition.reserveTickets(
          competitionSlug,
          voucher.ticketCount || 1
        );
        reservedTicketNumbers = ticketNumbers;
      } catch (err) {
        return res.status(400).json({ error: err.message || 'Not enough tickets available' });
      }
    }

    // --------- ATOMIC VOUCHER UPDATE (race-safe) ----------
    const qty = voucher.ticketCount || 1;
    const redemptionDoc = {
      userId: resolvedUserId,
      username: resolvedUsername,
      redeemedAt: new Date(),
      quantity: qty,
    };

    const atomicResult = await Voucher.updateOne(
      {
        _id: voucher._id,
        $expr: {
          $and: [
            // Global limit not exceeded
            { $lt: [{ $ifNull: ['$usedCount', 0] }, maxRedemptions] },
            // User-specific limit not exceeded
            {
              $lt: [
                {
                  $size: {
                    $filter: {
                      input: { $ifNull: ['$redemptions', []] },
                      as: 'r',
                      cond: {
                        $or: [
                          { $eq: ['$$r.userId', resolvedUserId] },
                          { $eq: ['$$r.username', resolvedUsername] },
                        ],
                      },
                    },
                  },
                },
                perUserLimit,
              ],
            },
          ],
        },
      },
      {
        $push: { redemptions: redemptionDoc }, // will create array if missing
        $inc: { usedCount: 1, redeemedCount: 1 },
        $set: { lastRedeemedAt: new Date() },
      }
    );

    if (atomicResult.modifiedCount !== 1) {
      // Optional: if you reserved numbers above, you might implement a release here.
      // await Competition.releaseTickets?.(competitionSlug, reservedTicketNumbers);
      return res.status(409).json({ error: 'Redemption limit reached (try again)' });
    }

    // Create the credit AFTER the voucher is atomically accepted
    const credit = await TicketCredit.create({
      userId: resolvedUserId,
      username: resolvedUsername,
      competitionSlug,
      qty,
      source: 'voucher',
      meta: { voucherId: voucher._id.toString(), codeLast4: code.slice(-4) },
      reservedTicketNumbers,
    });

    return res.status(200).json({
      ok: true,
      creditId: credit._id.toString(),
      competitionSlug,
      qty: credit.qty,
      reservedTicketNumbers,
    });
  } catch (err) {
    console.error('Voucher redeem error:', err);
    // Always return JSON so the client UI won’t hang on HTML errors
    return res.status(500).json({ error: 'Server error', detail: err?.message || String(err) });
  }
}
