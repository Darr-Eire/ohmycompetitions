// src/pages/api/pi/verify.js
import axios from 'axios';
import { MongoClient } from 'mongodb';

/* -------------------------- CORS (Pi mainnet) -------------------------- */
const ALLOWED_ORIGINS = [
  // your production domain(s)
  'https://ohmycompetitions.com',
  // Pi Browser asset/CDN origins (mainnet)
  'https://app-cdn.minepi.com',
  // Keep this just in case Pi Browser changes its asset host again
  'https://minepi.com',
];

function getAllowedOrigin(req) {
  const o = req.headers.origin || '';
  return ALLOWED_ORIGINS.includes(o) ? o : '';
}

function setCors(res, origin) {
  if (!origin) return;
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '600');
  // If you later need cookies across origins:
  // res.setHeader('Access-Control-Allow-Credentials', 'true');
}
/* ---------------------------------------------------------------------- */

/* ----------------------------- ENV & DB ------------------------------- */
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'ohmycompetitions-mainnet';
const PI_ENV = (process.env.PI_ENV || process.env.NEXT_PUBLIC_PI_ENV || 'mainnet').toLowerCase();

// Hard assert: this endpoint is mainnet-only
if (PI_ENV !== 'mainnet') {
  // Throwing here helps catch misconfigured deployments immediately
  // (If you want to allow both, remove this and branch on PI_ENV below)
  console.warn('[verify] WARNING: PI_ENV is not "mainnet" ->', PI_ENV);
}

if (!MONGODB_URI) {
  throw new Error('[verify] Missing MONGODB_URI');
}

// cache client across invocations (serverless friendly)
let cached = global._omc_mongo;
if (!cached) cached = global._omc_mongo = { client: null, db: null, connecting: null };

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

/* ------------------------- Referral helper ---------------------------- */
async function applyReferralCodeToNewUser(db, newUser, referralCodeRaw) {
  try {
    const code = String(referralCodeRaw || '').trim();
    if (!newUser?._id || !code) return false;

    const Users = db.collection('users');
    const referrer = await Users.findOne({ referralCode: code });
    if (!referrer) return false;
    if (referrer.username === newUser.username) return false;

    const bonus = 5;
    await Users.updateOne(
      { _id: newUser._id },
      { $set: { referredBy: code }, $inc: { bonusTickets: bonus } }
    );
    await Users.updateOne(
      { _id: referrer._id },
      { $inc: { bonusTickets: bonus, referralWeeklyCount: 1, referralCount: 1 } }
    );
    return true;
  } catch (err) {
    console.error('[verify] Referral apply error:', err);
    return false;
  }
}

/* ----------------------------- Handler -------------------------------- */
export default async function handler(req, res) {
  // CORS for both OPTIONS and POST
  const origin = getAllowedOrigin(req);
  setCors(res, origin);

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Hard assert environment at runtime (safety)
  if (PI_ENV !== 'mainnet') {
    return res.status(400).json({ success: false, error: `Invalid PI_ENV "${PI_ENV}" for /pi/verify. Expected "mainnet".` });
  }

  const accessToken = (req.body?.accessToken || '').toString().trim();
  const userData = req.body?.userData || {};
  const referralCode = (req.body?.referralCode || '').toString().trim();

  console.log('[verify] incoming', {
    hasAccessToken: !!accessToken,
    PI_ENV,
    MONGODB_DB,
  });

  if (!accessToken) {
    return res.status(400).json({ success: false, error: 'Missing access token' });
  }

  try {
    // 1) Verify token with Pi (mainnet)
    // Note: /v2/me works for mainnet; the environment difference is in the token origin (wallet/mainnet)
    const { data: piUser } = await axios.get('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10_000,
    });

    console.log('[verify] /v2/me OK', {
      uid: piUser?.uid,
      username: piUser?.username,
      roles: piUser?.roles,
      scopes: piUser?.credentials?.scopes,
    });

    if (!piUser?.uid || !piUser?.username) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user data from Pi Network',
        details: 'Missing uid or username',
      });
    }

    // Optional: require certain scopes on mainnet (tighten as needed)
    // const scopes = piUser?.credentials?.scopes || [];
    // if (!scopes.includes('username')) { ... }

    // 2) DB
    const db = await getDb();
    const Users = db.collection('users');
    const now = new Date();

    // 3) Upsert user (support legacy uid field) + ensure usernameLower
    const username = String(piUser.username);
    const usernameLower = username.toLowerCase();

    const upsert = await Users.findOneAndUpdate(
      {
        $or: [
          { piUserId: piUser.uid },
          { uid: piUser.uid }, // legacy
          { username: username },
        ],
      },
      {
        $setOnInsert: {
          createdAt: now,
          tickets: 0,
          bonusTickets: 0,
          referredBy: '',
          referralCode: null,
          country: userData?.country || null,
        },
        $set: {
          username,
          usernameLower,
          piUserId: piUser.uid,
          uid: piUser.uid,
          roles: Array.isArray(piUser.roles) ? piUser.roles : [],
          lastLogin: now,
          // keep last known client info if you want (device, locale, etc.)
        },
      },
      { upsert: true, returnDocument: 'after', returnOriginal: false }
    );

    let user = upsert?.value;
    if (!user) {
      user = await Users.findOne({
        $or: [
          { piUserId: piUser.uid },
          { uid: piUser.uid },
          { username: username },
        ],
      });
    }

    console.log('[verify] upserted', {
      found: !!user,
      updatedExisting: upsert?.lastErrorObject?.updatedExisting,
    });

    // 4) Referral only on brand-new users
    if (!upsert?.lastErrorObject?.updatedExisting && referralCode && user?._id) {
      await applyReferralCodeToNewUser(db, user, referralCode);
      user = await Users.findOne({ _id: user._id });
    }

    if (!user) {
      return res.status(500).json({ success: false, error: 'User not found after upsert' });
    }

    // 5) Return safe user (omit access tokens if any)
    const { accessToken: _omit, ...safeUser } = user;
    return res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    console.error('[verify] ERROR', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });

    const status = err?.response?.status;
    if (status === 401) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    if (status === 429) {
      return res.status(429).json({ success: false, error: 'Too many requests to Pi Network API' });
    }
    if (err?.name?.includes('Mongo')) {
      return res.status(500).json({ success: false, error: 'Database error occurred' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
