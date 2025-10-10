// /src/pages/api/vouchers/redeem.js
export const config = { api: { bodyParser: true } };

import { dbConnect } from 'lib/db';
import Voucher from 'models/Voucher';
import TicketCredit from 'models/TicketCredit';
import Competition from 'models/Competition';
import User from 'models/User';
import { hashCode } from 'lib/vouchers';

function getAuthUser(b) { const { username, userId } = b || {}; return { username: username || null, userId: userId || null }; }
function toBool(v){ if(v===true||v===false)return v; const s=String(v??'').toLowerCase(); return s==='true'||s==='1'; }

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    await dbConnect();

    const { code, competitionSlug: overrideSlug, reserve } = req.body || {};
    const wantReserve = toBool(reserve);
    if(!code) return res.status(400).json({error:'code required'});

    const { username, userId } = getAuthUser(req.body);
    if(!username && !userId) return res.status(400).json({error:'username or userId required'});

    // Resolve user
    let userDoc = null;
    if (username) userDoc = await User.findOne({ username }).lean();
    if (!userDoc && userId) userDoc = await User.findOne({ $or:[{uid:userId},{piUserId:userId},{id:userId}] }).lean();
    const resolvedUserId = userDoc?.uid || userDoc?.piUserId || userDoc?._id?.toString() || userId || username;
    const resolvedUsername = userDoc?.username || username || userId;

    // Anti-abuse: basic IP and user recent redemption throttle
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const recentKey = `voucher_${resolvedUsername || resolvedUserId}_${ip}`;
    global.__omcRecentVoucher = global.__omcRecentVoucher || new Map();
    const lastAt = global.__omcRecentVoucher.get(recentKey) || 0;
    if (now - lastAt < 30_000) return res.status(429).json({ error: 'Please wait before trying another voucher' });

    // Find voucher
    const voucher = await Voucher.findOne({ codeHash: hashCode(code) });
    if(!voucher) return res.status(404).json({error:'Invalid code'});

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date())
      return res.status(400).json({error:'Code expired'});
    if (voucher.assignedToUserId && voucher.assignedToUserId !== resolvedUserId)
      return res.status(403).json({error:'This code is not assigned to this user'});

    const totalUsed = voucher.usedCount ?? (voucher.redemptions?.length || 0);
    const maxRedemptions = voucher.maxRedemptions ?? 1;
    if (totalUsed >= maxRedemptions)
      return res.status(400).json({error:'Code fully redeemed'});

    const perUserLimit = voucher.perUserLimit ?? 1;
    const priorUserUses = (voucher.redemptions || []).filter(r => r.userId===resolvedUserId || r.username===resolvedUsername).length;
    if (priorUserUses >= perUserLimit)
      return res.status(400).json({error:'Per-user redemption limit reached'});

    const competitionSlug = overrideSlug || voucher.competitionSlug;
    if(!competitionSlug) return res.status(400).json({error:'Competition missing on voucher'});

    // Optional reserve inventory
    let reservedTicketNumbers = [];
    if (wantReserve) {
      try {
        const { ticketNumbers } = await Competition.reserveTickets(competitionSlug, voucher.ticketCount || 1);
        reservedTicketNumbers = ticketNumbers;
      } catch (err) {
        return res.status(400).json({ error: err.message || 'Not enough tickets available' });
      }
    }

    const qty = voucher.ticketCount || 1;
    const redemptionDoc = { userId: resolvedUserId, username: resolvedUsername, redeemedAt: new Date(), quantity: qty };

    // Atomic voucher update (creates redemptions array if missing)
    const atomic = await Voucher.updateOne(
      {
        _id: voucher._id,
        $expr: {
          $and: [
            { $lt: [ { $ifNull: ['$usedCount', 0] }, maxRedemptions ] },
            {
              $lt: [
                {
                  $size: {
                    $filter: {
                      input: { $ifNull: ['$redemptions', []] },
                      as: 'r',
                      cond: { $or: [ { $eq: ['$$r.userId', resolvedUserId] }, { $eq: ['$$r.username', resolvedUsername] } ] }
                    }
                  }
                },
                perUserLimit
              ]
            }
          ]
        }
      },
      { $push: { redemptions: redemptionDoc }, $inc: { usedCount: 1, redeemedCount: 1 }, $set: { lastRedeemedAt: new Date() } }
    );

    if (atomic.modifiedCount !== 1) {
      // Optional: release reservedTicketNumbers here if you add a releaseTickets helper
      return res.status(409).json({ error: 'Redemption limit reached (try again)' });
    }

    // Create credit after atomic success
    const credit = await TicketCredit.create({
      userId: resolvedUserId,
      username: resolvedUsername,
      competitionSlug,
      qty,
      source: 'voucher',
      meta: { voucherId: voucher._id.toString(), codeLast4: code.slice(-4) },
      reservedTicketNumbers
    });

    global.__omcRecentVoucher.set(recentKey, now);
    return res.status(200).json({ ok:true, creditId:credit._id.toString(), competitionSlug, qty:credit.qty, reservedTicketNumbers });
  }catch(err){
    console.error('Voucher redeem error:',err);
    return res.status(500).json({ error:'Server error', detail: err?.message || String(err) });
  }
}
