import { MongoClient } from 'mongodb';
import axios from 'axios';
import initCORS from '../../../lib/cors';

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGO_DB_URL;
const PI_API_KEY = process.env.PI_API_KEY;
// Use production API URL for both sandbox and production - sandbox is controlled by the SDK
const PI_API_URL = 'https://api.minepi.com/v2/payments';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_DB_URL environment variable inside .env.local'
  );
}

if (!PI_API_KEY) {
  throw new Error(
    'Please define the PI_API_KEY environment variable inside .env.local'
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

    const { paymentId } = req.query;

    console.log('🔄 A2U payout status request received:', {
      paymentId,
      query: req.query
    });

    if (!paymentId) {
      console.error('❌ Missing paymentId parameter');
      return res.status(400).json({ error: 'Missing paymentId parameter' });
    }

    // Get database connection
    const { db } = await connectToDatabase();

    // Get payout record from database
    const payoutRecord = await db.collection('payouts').findOne({ paymentId });
    if (!payoutRecord) {
      console.error('❌ Payout record not found:', paymentId);
      return res.status(404).json({ error: 'Payout record not found' });
    }

    console.log('📝 Payout record found:', {
      paymentId,
      userUid: payoutRecord.userUid,
      username: payoutRecord.username,
      amount: payoutRecord.amount,
      status: payoutRecord.status
    });

    try {
      // Check payment status with Pi Network
      console.log('🔄 Checking A2U payment status with Pi Network:', {
        paymentId,
        url: `${PI_API_URL}/${paymentId}`,
        apiKey: PI_API_KEY?.substring(0, 10) + '...'
      });

      const statusResponse = await axios.get(
        `${PI_API_URL}/${paymentId}`,
        {
          headers: { 
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const paymentStatus = statusResponse.data;
      console.log('📝 A2U payment status from Pi Network:', {
        paymentId,
        status: paymentStatus.status,
        identifier: paymentStatus.identifier,
        user_uid: paymentStatus.user_uid,
        amount: paymentStatus.amount,
        memo: paymentStatus.memo,
        metadata: paymentStatus.metadata,
        direction: paymentStatus.direction
      });

      // Update our database record with the latest status
      const updatedRecord = {
        ...payoutRecord,
        piStatus: paymentStatus.status,
        piResponse: paymentStatus,
        updatedAt: new Date()
      };

      // Determine overall status
      let overallStatus = 'created';
      if (paymentStatus.status?.cancelled || paymentStatus.status?.user_cancelled) {
        overallStatus = 'cancelled';
      } else if (paymentStatus.status?.developer_completed) {
        overallStatus = 'completed';
      } else if (paymentStatus.status?.transaction_verified) {
        overallStatus = 'processing';
      } else if (paymentStatus.status?.developer_approved) {
        overallStatus = 'approved';
      }

      updatedRecord.status = overallStatus;

      // Update the database record
      await db.collection('payouts').updateOne(
        { paymentId },
        { $set: updatedRecord }
      );

      console.log('✅ A2U payout status updated:', {
        paymentId,
        status: overallStatus,
        piStatus: paymentStatus.status
      });

      res.status(200).json({
        success: true,
        paymentId,
        userUid: payoutRecord.userUid,
        username: payoutRecord.username,
        amount: payoutRecord.amount,
        memo: payoutRecord.memo,
        reason: payoutRecord.reason,
        status: overallStatus,
        piStatus: paymentStatus.status,
        piNetworkResponse: paymentStatus,
        createdAt: payoutRecord.createdAt,
        updatedAt: updatedRecord.updatedAt
      });

    } catch (piError) {
      console.error('❌ Pi Network status check error:', {
        message: piError.message,
        response: piError.response?.data,
        status: piError.response?.status,
        paymentId
      });

      // Handle different types of errors
      if (piError.response?.status === 404) {
        return res.status(404).json({ 
          error: 'Payment not found on Pi Network',
          details: {
            type: 'not_found',
            paymentId,
            message: piError.response.data?.message || 'Payment not found'
          }
        });
      }

      // For other errors, return the payout record from our database
      res.status(200).json({
        success: true,
        paymentId,
        userUid: payoutRecord.userUid,
        username: payoutRecord.username,
        amount: payoutRecord.amount,
        memo: payoutRecord.memo,
        reason: payoutRecord.reason,
        status: payoutRecord.status,
        piStatus: payoutRecord.piStatus,
        createdAt: payoutRecord.createdAt,
        updatedAt: payoutRecord.updatedAt,
        note: 'Status retrieved from local database (Pi Network unavailable)'
      });
    }
  } catch (error) {
    console.error('❌ A2U payout status error:', {
      message: error.message,
      stack: error.stack,
      paymentId: req.query?.paymentId
    });
    
    res.status(500).json({ 
      error: 'Failed to retrieve payout status',
      details: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        stack: error.stack
      } : undefined
    });
  }
} 