import { MongoClient } from 'mongodb';
import axios from 'axios';
import initCORS from '../../../lib/cors';

/* ----------------------------- ENV & CONFIG ----------------------------- */
const PI_ENV = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'sandbox').toLowerCase();

const PI_API_KEY =
  (PI_ENV === 'testnet'
    ? process.env.PI_API_KEY_TESTNET
    : PI_ENV === 'mainnet'
    ? process.env.PI_API_KEY_MAINNET
    : process.env.PI_API_KEY_SANDBOX) ||
  process.env.PI_API_KEY ||          // legacy fallback
  process.env.PI_APP_SECRET;         // legacy fallback

if (!PI_API_KEY) {
  throw new Error(`[recover-payment] Missing Pi API key for PI_ENV=${PI_ENV}`);
}

const PI_API_BASE = process.env.PI_BASE_URL || 'https://api.minepi.com';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
const MONGODB_DB = process.env.MONGODB_DB || 'ohmycompetitions';
if (!MONGODB_URI) {
  throw new Error('[recover-payment] Missing Mongo URI (MONGODB_URI or MONGO_DB_URL)');
}

/* --------------------------- DB CONNECTION CACHE --------------------------- */
let cached = global._omc_mongo_recover || { client: null, db: null, connecting: null };
global._omc_mongo_recover = cached;

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

/* -------------------------------- HELPERS -------------------------------- */
function piAxios() {
  return axios.create({
    baseURL: PI_API_BASE,
    timeout: 15_000,
    headers: {
      Authorization: `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
}

const to2 = (n) => Number.parseFloat(Number(n).toFixed(2));

/* -------------------------------- HANDLER -------------------------------- */
export default async function handler(req, res) {
  try {
    const end = await initCORS(req, res);
    if (end) return;

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    console.log('[recover-payment] Start', { paymentId, PI_ENV, base: PI_API_BASE });

    const { client, db } = await getDb();
    const Payments = db.collection('payments');
    const Competitions = db.collection('competitions');

    // If we already completed, just return it
    const existing = await Payments.findOne({ paymentId });
    if (existing?.status === 'completed') {
      console.log('✅ Already completed (local)', { paymentId });
      return res.status(200).json({
        success: true,
        message: 'Payment already completed',
        payment: existing,
        recovered: false,
      });
    }

    // Pull canonical payment from Pi
    const ax = piAxios();
    const statusResp = await ax.get(`/v2/payments/${encodeURIComponent(paymentId)}`);
    const p = statusResp.data || {};

    console.log('[recover-payment] Pi payment', {
      id: p.identifier,
      amount: p.amount,
      memo: p.memo,
      developer_completed: p?.status?.developer_completed,
      transaction_verified: p?.status?.transaction_verified,
      username: p?.user?.username,
    });

    const meta = p?.metadata || {};
    const competitionSlug =
      meta.competitionSlug || meta.slug || meta.competition || null;

    if (!competitionSlug) {
      return res.status(400).json({
        error: 'Cannot recover payment - no competition information found in metadata',
        paymentStatus: p?.status,
      });
    }

    // If NOT yet developer_completed but transaction is verified, try to complete now
    if (!p?.status?.developer_completed && (p?.status?.transaction_verified || p?.transaction?.verified)) {
      try {
        await ax.post(`/v2/payments/${encodeURIComponent(paymentId)}/complete`, {
          txid: p?.transaction?.txid, // if we have it; Pi will often not require it here when already verified
        });
        console.log('[recover-payment] Called /complete successfully (or non-fatal)');
      } catch (e) {
        // Non-fatal: if verification already happened, we'll proceed to award idempotently.
        console.warn('[recover-payment] /complete call failed after verification; proceeding', e?.response?.data || e?.message);
      }
    }

    // If not verified and not completed -> cannot recover
    if (!p?.status?.developer_completed && !p?.status?.transaction_verified && !p?.transaction?.verified) {
      return res.status(400).json({
        error: 'Payment cannot be recovered - transaction not verified on Pi blockchain',
        status: p?.status,
        paymentId,
      });
    }

    // Load competition
    const competition = await Competitions.findOne({ 'comp.slug': competitionSlug });
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found', competitionSlug });
    }

    // Compute ticket qty from amount (fall back safely)
    const unit = to2(competition.comp.entryFee ?? competition.comp.piAmount);
    const paymentAmount = to2(p?.amount ?? unit);
    const ticketQty = Math.round(paymentAmount / unit);
    if (ticketQty < 1 || ticketQty > 50) {
      return res.status(400).json({ error: `Invalid ticket quantity: ${ticketQty}` });
    }
    const prizePoolAddition = paymentAmount * 0.5;

    // Award atomically
    const session = await client.startSession();
    let ticketNumber;
    let competitionStatus;

    try {
      await session.withTransaction(async () => {
        // idempotent re-check inside txn
        const done = await Payments.findOne({ paymentId, status: 'completed' }, { session });
        if (done) {
          ticketNumber = done.ticketNumber;
          competitionStatus = done.competitionStatus;
          return;
        }

        // Validate competition status/time/capacity (allow pending/draft for your debug policy)
        const now = Date.now();
        const start = new Date(competition.comp.startsAt).getTime();
        const end = new Date(competition.comp.endsAt).getTime();
        if (!['active', 'pending', 'draft'].includes(competition.comp.status)) {
          throw new Error(`Competition is not active (status: ${competition.comp.status})`);
        }
        if (now < start) throw new Error('Competition has not started yet');
        if (now > end) throw new Error('Competition has ended');
        if (competition.comp.ticketsSold + ticketQty > competition.comp.totalTickets) {
          throw new Error('Not enough tickets available');
        }

        // Update competition counters
        const after = await Competitions.findOneAndUpdate(
          {
            'comp.slug': competitionSlug,
            'comp.status': { $in: ['active', 'pending', 'draft'] },
            'comp.ticketsSold': { $lte: competition.comp.totalTickets - ticketQty },
          },
          {
            $inc: {
              'comp.ticketsSold': ticketQty,
              'comp.prizePool': prizePoolAddition,
            },
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
        if (!after?.value) throw new Error('Failed to update competition - may be sold out or inactive');

        const updated = after.value;
        const endNum = updated.comp.ticketsSold;
        const startNum = endNum - ticketQty + 1;
        ticketNumber = ticketQty === 1 ? endNum : `${startNum}-${endNum}`;
        competitionStatus = updated.comp.status;

        // Mark completed if full
        if (updated.comp.ticketsSold >= updated.comp.totalTickets && updated.comp.status !== 'completed') {
          await Competitions.updateOne(
            { 'comp.slug': competitionSlug },
            { $set: { 'comp.status': 'completed' } },
            { session }
          );
          competitionStatus = 'completed';
        }

        // Persist payment as completed
        await Payments.updateOne(
          { paymentId },
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              recoveredAt: new Date(),
              competitionSlug,
              amount: paymentAmount,
              ticketNumber,
              ticketQuantity: ticketQty,
              competitionStatus,
              prizePoolAddition,
              piUser: p?.user || null,
              piStatus: p?.status || null,
              piMetadata: p?.metadata || null,
              transaction: p?.transaction || null,
              note: 'Recovered via /api/pi/recover-payment',
            },
          },
          { upsert: true, session }
        );
      });
    } catch (txnErr) {
      await session.endSession().catch(() => {});
      throw txnErr;
    }
    await session.endSession();

    console.log('✅ Recovery successful', { paymentId, competitionSlug, ticketNumber, ticketQty });

    return res.status(200).json({
      success: true,
      message: 'Payment recovered successfully',
      recovered: true,
      paymentId,
      competitionSlug,
      ticketNumber,
      ticketQuantity: ticketQty,
      competitionStatus,
    });
  } catch (err) {
    const http = err?.response?.status;
    const body = err?.response?.data;

    console.error('[recover-payment] Error', {
      message: err?.message,
      http,
      body,
      stack: err?.stack,
    });

    if (http === 404) {
      return res.status(404).json({ error: 'Payment not found on Pi Network', details: body });
    }
    if (http === 401 || http === 403) {
      return res.status(http).json({ error: 'Invalid Pi Network API credentials', details: body });
    }
    if (http === 400) {
      return res.status(400).json({ error: 'Pi Network API error', details: body });
    }
    if (http >= 500) {
      return res.status(502).json({ error: 'Pi Network API server error', details: body });
    }

    return res.status(500).json({ error: err?.message || 'Payment recovery failed' });
  }
}
