import { MongoClient } from 'mongodb';
import axios from 'axios';
import initCORS from '../../../lib/cors';
import { canUserPurchaseTickets } from '../../../lib/userTicketLimits';

/* ----------------------------- ENV & CONFIG ----------------------------- */
const PI_ENV = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'sandbox').toLowerCase();

const PI_API_KEY =
  (PI_ENV === 'testnet'
    ? process.env.PI_API_KEY_TESTNET
    : PI_ENV === 'mainnet'
    ? process.env.PI_API_KEY_MAINNET
    : process.env.PI_API_KEY_SANDBOX) || process.env.PI_APP_SECRET;

if (!PI_API_KEY) throw new Error(`[complete-payment] Missing Pi API key for PI_ENV=${PI_ENV}`);

const PI_API_BASE = process.env.PI_BASE_URL || 'https://api.minepi.com';
const PI_API_URL = `${PI_API_BASE}/v2/payments`;

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
const MONGODB_DB = process.env.MONGODB_DB || 'ohmycompetitions';
if (!MONGODB_URI) throw new Error('[complete-payment] Missing Mongo URI');

/* --------------------------- DB CONNECTION CACHE --------------------------- */
let cached = global._omc_mongo_complete || { client: null, db: null, connecting: null };
global._omc_mongo_complete = cached;

async function getDb() {
  if (cached.db) return { client: cached.client, db: cached.db };
  if (!cached.connecting) {
    cached.connecting = (async () => {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      cached.client = client;
      cached.db = client.db(MONGODB_DB);
      return { client, db: cached.db };
    })();
  }
  return cached.connecting;
}

/* ------------------------------- HELPERS ------------------------------- */
function piAxios() {
  return axios.create({
    baseURL: PI_API_BASE,
    timeout: 30_000,
    headers: {
      Authorization: `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
}
const to2 = (n) => Number.parseFloat(Number(n).toFixed(2));

/* -------------------------------- HANDLER ------------------------------- */
export default async function handler(req, res) {
  try {
    const end = await initCORS(req, res);
    if (end) return;

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { paymentId, txid, slug, amount } = req.body || {};
    if (!paymentId || !txid || !slug) {
      return res.status(400).json({ error: 'Missing paymentId, txid, or slug' });
    }

    console.log('⚡ [complete-payment] Start', { paymentId, slug, txid, amount, PI_ENV });

    const { client, db } = await getDb();
    const Payments = db.collection('payments');
    const Competitions = db.collection('competitions');
    const Users = db.collection('users');

    /* ------------------------- Idempotency Check ------------------------- */
    const existing = await Payments.findOne({ paymentId });
    if (existing?.status === 'completed') {
      return res.status(200).json({
        message: 'Payment already completed',
        ticketNumber: existing.ticketNumber,
        competitionStatus: existing.competitionStatus,
      });
    }

    /* --------------------------- Validate Competition --------------------------- */
    const competition = await Competitions.findOne({ 'comp.slug': slug });
    if (!competition) return res.status(404).json({ error: 'Competition not found' });

    const ax = piAxios();
    const statusResp = await ax.get(`/v2/payments/${paymentId}`);
    const p = statusResp.data || {};

    console.log('🧾 [complete-payment] Pi status', {
      id: p.identifier,
      status: p.status,
      verified: p?.status?.transaction_verified,
      completed: p?.status?.developer_completed,
      amount: p.amount,
      user: p.user?.username || p.user?.uid,
    });

    /* ----------------------- Extract Pi User ----------------------- */
    const piUser = p.user?.uid || p.user?.username ? p.user : { uid: null, username: null };

    // If not developer_completed but verified → complete it
    if (!p?.status?.developer_completed) {
      if (p?.status?.transaction_verified || p?.transaction?.verified) {
        try {
          await ax.post(`/v2/payments/${paymentId}/complete`, { txid });
          console.log('✅ [complete-payment] Developer completed on Pi Network');
        } catch (e) {
          console.warn('⚠️ [complete-payment] Pi complete call failed, continuing', e?.message);
        }
      } else {
        return res.status(400).json({ error: 'Transaction not verified yet' });
      }
    }

    /* ---------------------- Begin Transaction ---------------------- */
    const session = client.startSession();
    let ticketNumber;
    let competitionStatus;

    try {
      await session.withTransaction(async () => {
        const done = await Payments.findOne({ paymentId, status: 'completed' }, { session });
        if (done) {
          ticketNumber = done.ticketNumber;
          competitionStatus = done.competitionStatus;
          return;
        }

        const current = await Competitions.findOne(
          { 'comp.slug': slug },
          {
            projection: {
              'comp.status': 1,
              'comp.ticketsSold': 1,
              'comp.totalTickets': 1,
              'comp.entryFee': 1,
              'comp.piAmount': 1,
              'comp.startsAt': 1,
              'comp.endsAt': 1,
              'comp.prizePool': 1,
            },
            session,
          }
        );
        if (!current) throw new Error('Competition not found during update');

        const now = Date.now();
        const start = new Date(current.comp.startsAt).getTime();
        const end = new Date(current.comp.endsAt).getTime();
        if (!['active', 'pending', 'draft'].includes(current.comp.status))
          throw new Error(`Competition inactive: ${current.comp.status}`);
        if (now < start) throw new Error('Competition has not started yet');
        if (now > end) throw new Error('Competition has ended');

        const unit = to2(current.comp.entryFee ?? current.comp.piAmount);
        const paymentAmount = to2(amount ?? p.amount ?? unit);
        const ticketQty = Math.round(paymentAmount / unit);
        if (ticketQty < 1 || ticketQty > 50) throw new Error(`Invalid ticket qty: ${ticketQty}`);
        if (current.comp.ticketsSold + ticketQty > current.comp.totalTickets)
          throw new Error('Not enough tickets available');

        /* ---- User Ticket Limit ---- */
        if (piUser?.uid || piUser?.username) {
          const userKey = piUser.uid || piUser.username;
          const userDoc = await Users.findOne(
            { $or: [{ uid: userKey }, { piUserId: userKey }, { username: userKey }] },
            { session }
          );
          const limitCheck = await canUserPurchaseTickets(
            userKey,
            slug,
            ticketQty,
            userDoc,
            current
          );
          if (!limitCheck.canPurchase) {
            throw new Error(
              `Ticket limit exceeded. You can only buy ${limitCheck.remaining} more.`
            );
          }
        }

        /* ---- Update Competition ---- */
        const prizePoolAddition = paymentAmount * 0.5;
        const after = await Competitions.findOneAndUpdate(
          {
            'comp.slug': slug,
            'comp.status': { $in: ['active', 'pending', 'draft'] },
            'comp.ticketsSold': { $lte: current.comp.totalTickets - ticketQty },
          },
          {
            $inc: { 'comp.ticketsSold': ticketQty, 'comp.prizePool': prizePoolAddition },
          },
          {
            projection: {
              'comp.status': 1,
              'comp.ticketsSold': 1,
              'comp.totalTickets': 1,
              'comp.prizePool': 1,
            },
            returnDocument: 'after',
            session,
          }
        );
        if (!after?.value) throw new Error('Competition update failed');

        const updated = after.value;
        const endNum = updated.comp.ticketsSold;
        const startNum = endNum - ticketQty + 1;
        ticketNumber = ticketQty === 1 ? endNum : `${startNum}-${endNum}`;
        competitionStatus = updated.comp.status;

        if (updated.comp.ticketsSold >= updated.comp.totalTickets && updated.comp.status !== 'completed') {
          await Competitions.updateOne(
            { 'comp.slug': slug },
            { $set: { 'comp.status': 'completed' } },
            { session }
          );
          competitionStatus = 'completed';
        }

        /* ---- Persist Payment ---- */
        await Payments.updateOne(
          { paymentId },
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              txid,
              competitionSlug: slug,
              ticketNumber,
              ticketQuantity: ticketQty,
              competitionStatus,
              piUser: { uid: piUser.uid || null, username: piUser.username || null },
              piStatus: p.status,
              transaction: p.transaction,
              amount: paymentAmount,
            },
          },
          { upsert: true, session }
        );
      });
    } finally {
      await session.endSession();
    }

    /* ------------------------- Award XP (best-effort) ------------------------- */
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      await fetch(`${site}/api/user/xp/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: piUser.uid,
          username: piUser.username,
          amount,
          reason: `Purchased ticket(s) for ${slug}`,
          source: 'payment',
        }),
      });
    } catch (e) {
      console.warn('[complete-payment] XP award non-critical error:', e?.message);
    }

    console.log('✅ [complete-payment] Done', { paymentId, ticketNumber, competitionStatus });
    return res.status(200).json({
      message: 'Payment completed',
      ticketNumber,
      competitionStatus,
    });
  } catch (err) {
    const http = err?.response?.status;
    const body = err?.response?.data;
    console.error('[complete-payment] Error', err?.message, http, body);

    if (http === 401 || http === 403)
      return res.status(http).json({ error: 'Invalid Pi credentials', details: body });
    if (http === 404)
      return res.status(404).json({ error: 'Payment not found', details: body });
    if (http >= 500)
      return res.status(502).json({ error: 'Pi Network server error', details: body });
    if (err.code === 'ECONNABORTED')
      return res.status(408).json({ error: 'Pi API timeout' });

    return res.status(500).json({ error: err.message || 'Payment completion failed' });
  }
}
