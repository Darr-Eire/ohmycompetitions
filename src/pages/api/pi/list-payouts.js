import { MongoClient } from 'mongodb';
import initCORS from '../../../lib/cors';

/* ----------------------------- Mongo connection ----------------------------- */
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
const MONGODB_DB  = process.env.MONGODB_DB || 'ohmycompetitions';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI or MONGO_DB_URL in env');
}

let cached = global._omc_mongo_list_payouts || { client: null, db: null, connecting: null };
global._omc_mongo_list_payouts = cached;

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

/* ---------------------------------- Handler --------------------------------- */
export default async function handler(req, res) {
  try {
    const end = await initCORS(req, res);
    if (end) return;

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse & sanitize query params
    const {
      status,
      userUid,
      from,           // ISO date string (inclusive)
      to,             // ISO date string (exclusive)
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = '20',
      skip = '0',
    } = req.query || {};

    const safeSortFields = new Set(['createdAt', 'updatedAt', 'amount', 'status', 'username']);
    const sortField = safeSortFields.has(sortBy) ? sortBy : 'createdAt';
    const sortDir = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;

    const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
    const parsedSkip  = Math.max(0, parseInt(skip, 10) || 0);

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (userUid) filter.userUid = userUid;

    // Date window (based on createdAt)
    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const d = new Date(from);
        if (!Number.isNaN(d.getTime())) filter.createdAt.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        if (!Number.isNaN(d.getTime())) filter.createdAt.$lt = d;
      }
      if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
    }

    const db = await getDb();

    // Projection: avoid returning heavy nested blobs
    const projection = {
      _id: 0,
      paymentId: 1,
      userUid: 1,
      username: 1,
      amount: 1,
      memo: 1,
      reason: 1,
      status: 1,
      piStatus: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const sort = { [sortField]: sortDir };

    const cursor = db
      .collection('payouts')
      .find(filter, { projection })
      .sort(sort)
      .skip(parsedSkip)
      .limit(parsedLimit);

    const [payouts, totalCount] = await Promise.all([
      cursor.toArray(),
      db.collection('payouts').countDocuments(filter),
    ]);

    const currentPage = Math.floor(parsedSkip / parsedLimit) + 1;
    const totalPages = Math.max(1, Math.ceil(totalCount / parsedLimit));
    const hasNext = parsedSkip + parsedLimit < totalCount;
    const hasPrev = parsedSkip > 0;

    return res.status(200).json({
      success: true,
      payouts,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit: parsedLimit,
        skip: parsedSkip,
        hasNext,
        hasPrev,
      },
      filter: { status: status || null, userUid: userUid || null, from: from || null, to: to || null },
      sort: { by: sortField, order: sortDir === 1 ? 'asc' : 'desc' },
    });
  } catch (error) {
    console.error('[list-payouts] Error', { message: error?.message, stack: error?.stack, query: req.query });
    return res.status(500).json({
      error: 'Failed to retrieve payouts',
      details: process.env.NODE_ENV === 'development'
        ? { originalError: error?.message, stack: error?.stack }
        : undefined,
    });
  }
}

/* ---------------------------------- Notes -----------------------------------
Recommended indexes in MongoDB for performance:

db.payouts.createIndex({ createdAt: -1 })
db.payouts.createIndex({ updatedAt: -1 })
db.payouts.createIndex({ userUid: 1, createdAt: -1 })
db.payouts.createIndex({ status: 1, createdAt: -1 })
db.payouts.createIndex({ paymentId: 1 }, { unique: true })
----------------------------------------------------------------------------- */
