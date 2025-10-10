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
  throw new Error(`[pi/incomplete] Missing Pi API key for PI_ENV=${PI_ENV}`);
}

const PI_API_BASE = process.env.PI_BASE_URL || 'https://api.minepi.com';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
const MONGODB_DB  = process.env.MONGODB_DB || 'ohmycompetitions';
if (!MONGODB_URI) {
  throw new Error('[pi/incomplete] Missing Mongo URI. Set MONGODB_URI or MONGO_DB_URL.');
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/* --------------------------- DB CONNECTION CACHE --------------------------- */
let cached = global._omc_mongo_incomplete || { client: null, db: null, connecting: null };
global._omc_mongo_incomplete = cached;

async function getDb() {
  if (cached.db) return { client: cached.client, db: cached.db };
  if (!cached.connecting) {
    cached.connecting = (async () => {
      const client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      await client.connect();
      cached.client = client;
      cached.db = client.db(MONGODB_DB);
      return { client, db: cached.db };
    })();
  }

  return cached.connecting;


  // Connect to cluster
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db();

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return { client, db };

}

/* --------------------------------- HELPERS --------------------------------- */
function piAxios() {
  return axios.create({
    baseURL: PI_API_BASE,
    timeout: 15000, // 15s for this lightweight check
    headers: {
      Authorization: `Key ${PI_API_KEY}`, // server-to-Pi uses Key, not Bearer
      'Content-Type': 'application/json',
    },
  });
}

const to2 = (n) => Number.parseFloat(Number(n).toFixed(2));

/* ---------------------------------- ROUTE ---------------------------------- */
export default async function handler(req, res) {
  try {
    const end = await initCORS(req, res);
    if (end) return;

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { payment, slug } = req.body || {};
    if (!payment?.identifier) {
      return res.status(400).json({ error: 'Missing payment data (identifier required)' });
    }

    const paymentId = payment.identifier;
    console.log('[pi/incomplete] Handling incomplete payment', { paymentId, slug, PI_ENV });

    const { db } = await getDb();
    const Incomplete = db.collection('incomplete_payments');

    // Get canonical status from Pi
    let paymentStatus;
    try {
      const { data } = await piAxios().get(`/v2/payments/${encodeURIComponent(paymentId)}`);
      paymentStatus = data;
      console.log('[pi/incomplete] Pi status', {
        id: data?.identifier,
        status: data?.status,
        txid: data?.transaction?.txid,
        amount: data?.amount,
      });
    } catch (piErr) {
      console.error('[pi/incomplete] Pi status error', {
        message: piErr?.message,
        http: piErr?.response?.status,
        body: piErr?.response?.data,
      });

      // Log anyway so we have a trail
      await Incomplete.updateOne(
        { paymentId },
        {
          $set: {
            paymentId,
            slug: slug || payment?.metadata?.slug || payment?.metadata?.competitionSlug || null,
            payment,
            error: piErr?.message,
            updatedAt: new Date(),
            loggedAt: new Date(),
          },
        },
        { upsert: true }
      );

      // Return a soft-OK so client can proceed (user can retry/cancel)
      return res.status(200).json({
        message: 'Incomplete payment logged (Pi API unavailable)',
        paymentId,
      });
    }

    const now = new Date();

    // Upsert the incomplete record with the latest Pi status
    await Incomplete.updateOne(
      { paymentId },
      {
        $set: {
          paymentId,
          slug: slug || payment?.metadata?.slug || payment?.metadata?.competitionSlug || null,
          payment,
          piStatus: paymentStatus?.status || null,
          piResponse: paymentStatus || null,
          updatedAt: now,
          loggedAt: now,
        },
      },
      { upsert: true }
    );

    // If verified on-chain, attempt to complete it via our complete-payment handler
    const isVerified =
      Boolean(paymentStatus?.status?.transaction_verified) ||
      Boolean(paymentStatus?.transaction?.verified);

    if (isVerified) {
      const resolvedSlug =
        slug ||
        payment?.metadata?.slug ||
        payment?.metadata?.competitionSlug ||
        'match-pi-retry';

      const txid = paymentStatus?.transaction?.txid || null;
      const amount = to2(payment?.amount ?? paymentStatus?.amount ?? 0.01);

      console.log('[pi/incomplete] Verified on-chain, attempting /complete-payment', {
        paymentId,
        resolvedSlug,
        txid,
        amount,
      });

      try {
        const resp = await fetch(`${SITE_URL}/api/pi/complete-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            txid,
            slug: resolvedSlug,
            amount,
          }),
        });

        if (resp.ok) {
          const result = await resp.json();
          console.log('[pi/incomplete] Successfully completed via recovery', result);
          return res.status(200).json({
            message: 'Incomplete payment completed successfully',
            paymentId,
            result,
          });
        } else {
          const txt = await resp.text();
          console.warn('[pi/incomplete] complete-payment returned non-OK', txt);
        }
      } catch (completeErr) {
        console.warn('[pi/incomplete] complete-payment call failed', completeErr?.message);
      }
    }

    // Not verified: ask user to cancel from wallet (prevents UI deadlock)
    if (!paymentStatus?.transaction?.txid) {
      return res.status(400).json({
        error: 'pending_payment',
        message:
          'You have a pending payment that cannot be completed automatically. Please open your Pi wallet and cancel the payment, then try again.',
        paymentId,
      });
    }

    // Else: we logged it and couldn’t complete — tell client it’s recorded
    return res.status(200).json({
      message: 'Incomplete payment handled',
      paymentId,
      status: paymentStatus?.status || null,
    });
  } catch (err) {
    console.error('[pi/incomplete] Handler error', { message: err?.message, stack: err?.stack });
    return res.status(500).json({
      error: 'Failed to handle incomplete payment',
      details: err?.message || 'Unknown error',
    });
  }
}
