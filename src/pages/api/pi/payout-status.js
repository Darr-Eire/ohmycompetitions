import { MongoClient } from 'mongodb';
import axios from 'axios';
import initCORS from '../../../lib/cors';

/* ------------------------------- Env & Config ------------------------------- */
const PI_ENV = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'sandbox').toLowerCase();

const PI_API_KEY =
  (PI_ENV === 'testnet'
    ? process.env.PI_API_KEY_TESTNET
    : PI_ENV === 'mainnet'
    ? process.env.PI_API_KEY_MAINNET
    : process.env.PI_API_KEY_SANDBOX) ||
  process.env.PI_API_KEY ||           // legacy fallback
  process.env.PI_APP_SECRET;          // legacy fallback

if (!PI_API_KEY) {
  throw new Error(`[payout-status] Missing Pi API key for PI_ENV=${PI_ENV}`);
}

const PI_API_BASE = process.env.PI_BASE_URL || 'https://api.minepi.com';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
const MONGODB_DB = process.env.MONGODB_DB || 'ohmycompetitions';
if (!MONGODB_URI) {
  throw new Error('[payout-status] Missing Mongo URI. Set MONGODB_URI or MONGO_DB_URL.');
}

/* ------------------------------ Mongo (cached) ------------------------------ */
let cached = global._omc_mongo_payout_status || { client: null, db: null, connecting: null };
global._omc_mongo_payout_status = cached;

async function getDb() {
  if (cached.db) return cached.db;
  if (!cached.connecting) {
    cached.connecting = (async () => {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      cached.client = client;
      cached.db = client.db(MONGODB_DB);
      return cached.db;
    })();
  }
  return cached.connecting;
}

/* --------------------------------- Helpers --------------------------------- */
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

function deriveOverallStatus(piStatus = {}) {
  // Normalize Pi status flags to a simple lifecycle for dashboards
  if (piStatus.cancelled || piStatus.user_cancelled) return 'cancelled';
  if (piStatus.developer_completed) return 'completed';
  if (piStatus.transaction_verified) return 'processing';
  if (piStatus.developer_approved) return 'approved';
  return 'created';
}

/* ---------------------------------- Route ---------------------------------- */
export default async function handler(req, res) {
  try {
    const end = await initCORS(req, res);
    if (end) return;

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId } = req.query || {};
    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId parameter' });
    }

    const db = await getDb();
    const Payouts = db.collection('payouts');

    // Load our local payout record (so we can respond even if Pi API fails)
    const payoutRecord = await Payouts.findOne({ paymentId });
    if (!payoutRecord) {
      return res.status(404).json({ error: 'Payout record not found' });
    }

    console.log('[payout-status] Checking A2U status', {
      paymentId,
      PI_ENV,
      base: PI_API_BASE,
    });

    try {
      // Hit Pi v2 canonical endpoint
      const { data: payment } = await piAxios().get(`/v2/payments/${encodeURIComponent(paymentId)}`);

      // Log a minimal snapshot
      console.log('[payout-status] Pi response', {
        id: payment?.identifier,
        direction: payment?.direction,
        amount: payment?.amount,
        username: payment?.user?.username,
        status: payment?.status,
      });

      // Update our DB copy
      const overallStatus = deriveOverallStatus(payment?.status || {});
      const updatedAt = new Date();

      await Payouts.updateOne(
        { paymentId },
        {
          $set: {
            status: overallStatus,
            piStatus: payment?.status || null,
            piResponse: payment || null,
            updatedAt,
          },
        }
      );

      // Respond with merged data
      return res.status(200).json({
        success: true,
        paymentId,
        userUid: payoutRecord.userUid ?? payment?.user?.uid ?? payment?.user_uid ?? null,
        username: payoutRecord.username ?? payment?.user?.username ?? null,
        amount: payoutRecord.amount ?? payment?.amount ?? null,
        memo: payoutRecord.memo ?? payment?.memo ?? null,
        reason: payoutRecord.reason ?? null,
        direction: payment?.direction ?? 'app_to_user',
        status: overallStatus,
        piStatus: payment?.status ?? null,
        piNetworkResponse: payment,
        createdAt: payoutRecord.createdAt ?? null,
        updatedAt,
      });
    } catch (piError) {
      // Granular handling for Pi API failures
      const http = piError?.response?.status;
      const body = piError?.response?.data;

      console.error('[payout-status] Pi API error', {
        message: piError?.message,
        http,
        body,
      });

      if (http === 404) {
        return res.status(404).json({
          error: 'Payment not found on Pi Network',
          details: {
            type: 'not_found',
            paymentId,
            message: body?.message || 'Payment not found',
          },
        });
      }

      // Fall back to our local record if Pi is unavailable or other error
      return res.status(200).json({
        success: true,
        paymentId,
        userUid: payoutRecord.userUid ?? null,
        username: payoutRecord.username ?? null,
        amount: payoutRecord.amount ?? null,
        memo: payoutRecord.memo ?? null,
        reason: payoutRecord.reason ?? null,
        status: payoutRecord.status ?? 'created',
        piStatus: payoutRecord.piStatus ?? null,
        createdAt: payoutRecord.createdAt ?? null,
        updatedAt: payoutRecord.updatedAt ?? null,
        note: 'Status from local database (Pi API unavailable)',
      });
    }
  } catch (error) {
    console.error('[payout-status] Handler error', {
      message: error?.message,
      stack: error?.stack,
      paymentId: req.query?.paymentId,
    });

    return res.status(500).json({
      error: 'Failed to retrieve payout status',
      details:
        process.env.NODE_ENV === 'development'
          ? { originalError: error?.message, stack: error?.stack }
          : undefined,
    });
  }
}
