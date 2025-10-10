import { MongoClient } from 'mongodb';
import axios from 'axios';
import initCORS from '../../../lib/cors';
import { canUserPurchaseTickets } from '../../../lib/userTicketLimits';

/* ------------------------------- Env & Config ------------------------------- */
const PI_ENV = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'sandbox').toLowerCase();

const PI_API_KEY =
  (PI_ENV === 'testnet'
    ? process.env.PI_API_KEY_TESTNET
    : PI_ENV === 'mainnet'
    ? process.env.PI_API_KEY_MAINNET
    : process.env.PI_API_KEY_SANDBOX) || process.env.PI_APP_SECRET;

if (!PI_API_KEY) {
  throw new Error(`[approve-payment] Missing Pi API key for PI_ENV=${PI_ENV}`);
}

const PI_API_BASE = process.env.PI_BASE_URL || 'https://api.minepi.com';
const PI_API_URL = `${PI_API_BASE}/v2/payments`;

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
if (!MONGODB_URI) throw new Error('[approve-payment] Missing Mongo URI');

/* ------------------------------ MongoDB Connect ----------------------------- */
let cached = global._omc_mongo_approve || { client: null, db: null, connecting: null };
global._omc_mongo_approve = cached;

async function getDb() {
  if (cached.db) return cached.db;
  if (!cached.connecting) {
    cached.connecting = (async () => {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const dbName = process.env.MONGODB_DB || 'ohmycompetitions';
      cached.client = client;
      cached.db = client.db(dbName);
      return cached.db;
    })();
  }
  return cached.connecting;
}

/* --------------------------------- Helpers --------------------------------- */
function piAxios() {
  return axios.create({
    baseURL: PI_API_BASE,
    timeout: 30000,
    headers: {
      Authorization: `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
}

const to2 = (n) => Number.parseFloat(Number(n).toFixed(2));

/* --------------------------------- Handler --------------------------------- */
export default async function handler(req, res) {
  try {
   const corsDone = await initCORS(req, res);
    if (corsDone) return;

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { paymentId, slug, amount } = req.body || {};
    if (!paymentId || !slug || amount == null)
      return res.status(400).json({ error: 'Missing paymentId, slug, or amount' });

    const receivedAmount = to2(amount);
    console.log('🔹 Approve-payment start', { paymentId, slug, receivedAmount, PI_ENV });

    const db = await getDb();
    const Payments = db.collection('payments');
    const Competitions = db.collection('competitions');
    const Users = db.collection('users');

    // Idempotency check
    const existing = await Payments.findOne({ paymentId });
    if (existing?.status === 'approved' || existing?.status === 'completed') {
      console.log('✅ Already approved:', paymentId);
      return res.status(200).json({ message: 'Payment already approved', status: existing.status });
    }

    // Validate competition
    const competition = await Competitions.findOne({ 'comp.slug': slug });
    if (!competition) return res.status(404).json({ error: 'Competition not found' });

    const now = Date.now();
    const start = new Date(competition.comp.startsAt).getTime();
    const endMs = new Date(competition.comp.endsAt).getTime();


    if (!['active', 'pending', 'draft'].includes(competition.comp.status))
      return res.status(400).json({ error: `Competition not active (status: ${competition.comp.status})` });
    if (competition.comp.ticketsSold >= competition.comp.totalTickets)
      return res.status(400).json({ error: 'Competition full' });
    if (now < start) return res.status(400).json({ error: 'Competition not started yet' });
    if (now > end) return res.status(400).json({ error: 'Competition ended' });

    // Validate payment amount
    const singleTicketPrice = to2(competition.comp.entryFee ?? competition.comp.piAmount);
    const ticketQuantity = Math.round(receivedAmount / singleTicketPrice);
    const expectedAmount = to2(singleTicketPrice * ticketQuantity);
    if (
      Math.abs(expectedAmount - receivedAmount) > 0.01 ||
      ticketQuantity < 1 ||
      ticketQuantity > 50
    ) {
      return res.status(400).json({
        error: `Payment mismatch. Expected multiple of ${singleTicketPrice} π`,
        details: { receivedAmount, expectedAmount, ticketQuantity },
      });
    }

    console.log('✅ Payment validated', { singleTicketPrice, receivedAmount, ticketQuantity });

    /* -------------------- Check Payment Status with Pi Network -------------------- */
    const ax = piAxios();
    console.log('🔄 Checking Pi payment status...');
    const statusResponse = await ax.get(`/v2/payments/${paymentId}`);
    const p = statusResponse.data || {};

    console.log('📄 Pi Network Payment:', {
      id: p.identifier,
      status: p.status,
      amount: p.amount,
      user: p.user?.username,
    });

    // Check user ticket limits (if user exists)
    if (p.user?.uid || p.user?.username) {
      const userId = p.user.uid || p.user.username;
      const userDoc = await Users.findOne({
        $or: [{ uid: userId }, { piUserId: userId }, { username: userId }],
      });

      if (userDoc) {
        const limitCheck = await canUserPurchaseTickets(userId, slug, ticketQuantity, userDoc, competition);
        if (!limitCheck.canPurchase) {
          return res.status(400).json({
            error: `Ticket limit exceeded. You can only buy ${limitCheck.remaining} more (limit ${limitCheck.limit}, current ${limitCheck.currentCount}).`,
          });
        }
      }
    }

    /* ---------------------- If already developer-approved ---------------------- */
    if (p?.status?.developer_approved) {
      await Payments.updateOne(
        { paymentId },
        {
          $set: {
            status: 'approved',
            competitionSlug: slug,
            amount: receivedAmount,
            updatedAt: new Date(),
            piStatus: p.status,
            piUser: p.user,
            piMetadata: p.metadata,
          },
        },
        { upsert: true }
      );

      return res.status(200).json({
        message: 'Payment already approved by Pi Network',
        status: p.status,
        amount: receivedAmount,
      });
    }

    /* ---------------------------- Approve with Pi API --------------------------- */
    console.log('🚀 Approving payment via Pi API...');
    const approveResp = await ax.post(`/v2/payments/${paymentId}/approve`, {});
    const approved = approveResp.data || {};

    if (!approved?.status?.developer_approved)
      return res.status(502).json({ error: 'Pi approval failed', details: approved });

    await Payments.updateOne(
      { paymentId },
      {
        $set: {
          status: 'approved',
          competitionSlug: slug,
          amount: receivedAmount,
          updatedAt: new Date(),
          piStatus: approved.status,
          piUser: approved.user || p.user,
          piMetadata: approved.metadata || p.metadata,
        },
      },
      { upsert: true }
    );

    console.log('✅ Approved and saved', paymentId);

    return res.status(200).json({
      message: 'Payment approved successfully',
      status: approved.status,
      amount: receivedAmount,
    });
  } catch (err) {
    const http = err?.response?.status;
    const data = err?.response?.data;
    console.error('[approve-payment] Error', err?.message, http, data);

    if (http === 404)
      return res.status(404).json({ error: 'Payment not found on Pi Network', details: data });
    if (http === 401 || http === 403)
      return res.status(http).json({ error: 'Invalid Pi API key', details: data });
    if (http >= 500)
      return res.status(502).json({ error: 'Pi Network server error', details: data });
    if (err.code === 'ECONNABORTED')
      return res.status(408).json({ error: 'Pi API timeout, please retry' });

    return res.status(500).json({
      error: 'Payment approval failed',
      details:
        process.env.NODE_ENV === 'development'
          ? { message: err.message, stack: err.stack }
          : undefined,
    });
  }
}
