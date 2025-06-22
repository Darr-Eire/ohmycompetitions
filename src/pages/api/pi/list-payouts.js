import { MongoClient } from 'mongodb';
import initCORS from '../../../lib/cors';

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGO_DB_URL;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_DB_URL environment variable inside .env.local'
  );
}

// Create a cached connection variable
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Connect to cluster
  const client = new MongoClient(MONGODB_URI);

  await client.connect();
  const db = client.db();

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  try {
    // Handle CORS
    const shouldEndRequest = await initCORS(req, res);
    if (shouldEndRequest) {
      return;
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      status, 
      userUid, 
      limit = '20', 
      skip = '0', 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('🔄 List payouts request received:', {
      status,
      userUid,
      limit,
      skip,
      sortBy,
      sortOrder,
      query: req.query
    });

    // Get database connection
    const { db } = await connectToDatabase();

    // Build query filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (userUid) {
      filter.userUid = userUid;
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    console.log('📝 Query filter and options:', {
      filter,
      sortOptions,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    // Get payouts with pagination
    const payouts = await db.collection('payouts')
      .find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();

    // Get total count for pagination
    const totalCount = await db.collection('payouts').countDocuments(filter);

    console.log('✅ Payouts retrieved:', {
      count: payouts.length,
      totalCount,
      filter
    });

    // Calculate pagination info
    const currentPage = Math.floor(parseInt(skip) / parseInt(limit)) + 1;
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNext = parseInt(skip) + parseInt(limit) < totalCount;
    const hasPrev = parseInt(skip) > 0;

    res.status(200).json({
      success: true,
      payouts: payouts.map(payout => ({
        paymentId: payout.paymentId,
        userUid: payout.userUid,
        username: payout.username,
        amount: payout.amount,
        memo: payout.memo,
        reason: payout.reason,
        status: payout.status,
        piStatus: payout.piStatus,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt
      })),
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasNext,
        hasPrev
      },
      filter: {
        status,
        userUid
      }
    });

  } catch (error) {
    console.error('❌ List payouts error:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    
    res.status(500).json({ 
      error: 'Failed to retrieve payouts',
      details: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        stack: error.stack
      } : undefined
    });
  }
} 