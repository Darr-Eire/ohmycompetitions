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
  throw new Error(`[pi/send-payout] Missing Pi API key for PI_ENV=${PI_ENV}`);
}

const PI_APP_ID = process.env.PI_APP_ID || process.env.NEXT_PUBLIC_PI_APP_ID || 'omc';
const PI_API_BASE = process.env.PI_BASE_URL || 'https://api.minepi.com';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
const MONGODB_DB  = process.env.MONGODB_DB || 'ohmycompetitions';
if (!MONGODB_URI) {
  throw new Error('[pi/send-payout] Missing Mongo URI. Set MONGODB_URI or MONGO_DB_URL.');
}

/* --------------------------- DB CONNECTION CACHE --------------------------- */
let cached = global._omc_mongo_send_payout || { client: null, db: null, connecting: null };
global._omc_mongo_send_payout = cached;

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

/* --------------------------------- HELPERS --------------------------------- */
function piAxios() {
  return axios.create({
    baseURL: PI_API_BASE,
    timeout: 30_000,
    headers: {
      Authorization: `Key ${PI_API_KEY}`, // server-to-Pi uses Key, not Bearer
      'Content-Type': 'application/json',
      'User-Agent': `OhMyCompetitions/${PI_APP_ID}`,
    },
  });
}
const clamp2 = (n) => Number.parseFloat(Number(n).toFixed(2));

/* ---------------------------------- ROUTE ---------------------------------- */
export default async function handler(req, res) {
  try {
    const end = await initCORS(req, res);
    if (end) return;

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userUid, amount, memo, metadata, reason } = req.body || {};

    if (!userUid || amount == null) {
      return res.status(400).json({ error: 'Missing required parameters: userUid and amount' });
    }

    // Validate amount (you can adjust limits)
    const payoutAmount = clamp2(amount);
    if (!Number.isFinite(payoutAmount) || payoutAmount <= 0 || payoutAmount > 1000) {
      return res.status(400).json({ error: 'Invalid amount. Must be between 0.01 and 1000 π' });
    }

    const { db } = await getDb();
    const Users = db.collection('users');
    const Payouts = db.collection('payouts');

    // Find user by uid | piUserId | username
    const user =
      (await Users.findOne({ uid: userUid })) ||
      (await Users.findOne({ piUserId: userUid })) ||
      (await Users.findOne({ username: userUid }));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const memoStr =
      memo || `Payout from OhMyCompetitions${reason ? `: ${reason}` : ''}`;

    const payload = {
      uid: userUid,
      amount: payoutAmount,
      memo: memoStr,
      metadata: {
        type: 'app_to_user_payout',
        reason: reason || 'reward',
        appId: PI_APP_ID,
        ts: Date.now(),
        ...(metadata || {}),
      },
    };

    const ax = piAxios();

    // Create A2U payment
    const { data: create } = await ax.post('/v2/payments', payload);

    if (!create?.identifier) {
      return res.status(502).json({
        error: 'Failed to create A2U payment with Pi Network',
        details: create,
      });
    }

    const paymentId = create.identifier;

    // Idempotent upsert of payout record
    await Payouts.updateOne(
      { paymentId },
      {
        $set: {
          paymentId,
          userUid,
          username: user.username || null,
          amount: payoutAmount,
          memo: payload.memo,
          metadata: payload.metadata,
          reason: reason || 'reward',
          status: 'created',
          piResponse: create,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      env: PI_ENV,
      message: 'Payout created successfully',
      paymentId,
      userUid,
      username: user.username || null,
      amount: payoutAmount,
      memo: payload.memo,
      status: 'created',
      piNetworkResponse: create,
    });
  } catch (err) {
    const http = err?.response?.status;
    const body = err?.response?.data;

    console.error('[pi/send-payout] Error', {
      message: err?.message,
      http,
      body,
    });

    if (err?.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Pi Network API timeout',
        details: { type: 'timeout' },
      });
    }
    if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Pi Network API unavailable',
        details: { type: 'network_error' },
      });
    }
    if (http === 401 || http === 403) {
      return res.status(http).json({
        error: 'Invalid Pi Network API credentials',
        details: body,
      });
    }
    if (http === 404) {
      return res.status(404).json({
        error: 'User or endpoint not found on Pi Network',
        details: body,
      });
    }
    if (http === 400) {
      return res.status(400).json({
        error: 'Pi Network API error',
        details: body,
      });
    }
    if (http >= 500) {
      return res.status(502).json({
        error: 'Pi Network API server error',
        details: body,
      });
    }

    return res.status(500).json({
      error: 'Payout creation failed',
      details: err?.message || 'Unknown error',
    });
  }
}
