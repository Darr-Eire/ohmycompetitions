// src/pages/api/pi/verify.js
import axios from 'axios';
import { MongoClient } from 'mongodb';

/* ----------------------------- Env & Mongo cache ---------------------------- */
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'ohmycompetitions';

if (!MONGODB_URI) {
  throw new Error('[verify] Missing MONGODB_URI environment variable');
}

// Cache the client across hot-reloads / serverless invocations
let cached = global._omc_mongo;
if (!cached) {
  cached = global._omc_mongo = { client: null, db: null, connecting: null };
}

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

/* -------------------- Referral application for brand-new user ------------------- */
async function applyReferralCodeToNewUser(db, newUser, referralCode) {
  try {
    if (!newUser?._id) return false;
    const code = String(referralCode || '').trim();
    if (!code) return false;

    // Find referrer by referralCode
    const referrer = await db.collection('users').findOne({ referralCode: code });
    if (!referrer) return false;
    if (referrer.username === newUser.username) return false; // no self-referrals

    const bonus = 5;

    await db.collection('users').updateOne(
      { _id: newUser._id },
      { $set: { referredBy: code }, $inc: { bonusTickets: bonus } }
    );

    await db.collection('users').updateOne(
      { _id: referrer._id },
      { $inc: { bonusTickets: bonus } }
    );

    return true;
  } catch (err) {
    console.error('[verify] Referral apply error:', err);
    return false;
  }
}

/* --------------------------------- Handler --------------------------------- */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { accessToken, userData, referralCode } = req.body || {};
  if (!accessToken) {
    return res.status(400).json({ success: false, error: 'Missing access token' });
  }

  try {
    // 1) Verify token with Pi Network
    const { data: piUser } = await axios.get('https://api.minepi.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    });

    if (!piUser?.uid || !piUser?.username) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user data from Pi Network',
        details: 'Missing uid or username',
      });
    }

    // 2) Connect DB
    const db = await getDb();
    const Users = db.collection('users');

    // 3) Upsert user (support legacy uid field)
    const now = new Date();
    const upsert = await Users.findOneAndUpdate(
      {
        $or: [
          { piUserId: piUser.uid },
          { uid: piUser.uid }, // legacy support
          { username: piUser.username },
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
          username: piUser.username,
          piUserId: piUser.uid,
          uid: piUser.uid,
          roles: Array.isArray(piUser.roles) ? piUser.roles : [],
          lastLogin: now,
          // ❗ Never persist the Pi access token
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    let user = upsert?.value;

    // 4) If this was a new insert, optionally apply referral bonus
    if (!upsert?.lastErrorObject?.updatedExisting && referralCode) {
      await applyReferralCodeToNewUser(db, user, referralCode);
      user = await Users.findOne({ _id: user._id });
    }

    // 5) Send safe user back
    const { accessToken: _omit, ...safeUser } = user || {};
    return res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    console.error('[verify] Handler error:', err);

    // Specific Pi API errors
    const status = err?.response?.status;
    if (status === 401) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token', details: err.response?.data });
    }
    if (status === 429) {
      return res.status(429).json({ success: false, error: 'Too many requests to Pi Network API' });
    }

    // Mongo errors
    if (err?.name === 'MongoError' || err?.name === 'MongoServerError') {
      return res.status(500).json({ success: false, error: 'Database error occurred' });
    }

    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
