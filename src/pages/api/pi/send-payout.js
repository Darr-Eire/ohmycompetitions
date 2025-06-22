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

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userUid, amount, memo, metadata, reason } = req.body;

    console.log('🔄 App-to-User payout request received:', {
      userUid,
      amount,
      memo,
      metadata,
      reason,
      body: req.body
    });

    if (!userUid || !amount) {
      console.error('❌ Missing required parameters:', { userUid, amount });
      return res.status(400).json({ error: 'Missing required parameters: userUid and amount' });
    }

    // Validate amount
    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount <= 0 || payoutAmount > 1000) {
      console.error('❌ Invalid payout amount:', { amount, payoutAmount });
      return res.status(400).json({ error: 'Invalid amount. Must be between 0.01 and 1000 Pi' });
    }

    // Get database connection
    const { db } = await connectToDatabase();

    // Check if user exists in our database
    const user = await db.collection('users').findOne({ uid: userUid });
    if (!user) {
      console.error('❌ User not found:', userUid);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('📝 User found for payout:', {
      uid: user.uid,
      username: user.username,
      email: user.email
    });

    try {
      // Create App-to-User payment with Pi Network
      console.log('🔄 Creating App-to-User payment with Pi Network:', {
        userUid,
        amount: payoutAmount,
        url: PI_API_URL
      });

      const paymentData = {
        uid: userUid,
        amount: payoutAmount,
        memo: memo || `Payout from OhMyCompetitions: ${reason || 'Reward'}`,
        metadata: {
          type: 'app_to_user_payout',
          reason: reason || 'reward',
          timestamp: Date.now(),
          ...metadata
        }
      };

      const piResponse = await axios.post(
        PI_API_URL,
        paymentData,
        {
          headers: { 
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('📝 Pi Network A2U payment response:', {
        paymentId: piResponse.data.identifier,
        response: piResponse.data,
        status: piResponse.status
      });

      if (!piResponse.data?.identifier) {
        console.error('❌ Pi Network A2U payment creation failed:', {
          response: piResponse.data
        });
        throw new Error('Failed to create A2U payment with Pi Network');
      }

      const paymentId = piResponse.data.identifier;

      // Store payout record in database
      const payoutRecord = {
        paymentId,
        userUid,
        username: user.username,
        amount: payoutAmount,
        memo: paymentData.memo,
        metadata: paymentData.metadata,
        reason: reason || 'reward',
        status: 'created',
        piResponse: piResponse.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('payouts').insertOne(payoutRecord);

      console.log('✅ A2U payout created successfully:', {
        paymentId,
        userUid,
        username: user.username,
        amount: payoutAmount,
        reason
      });

      res.status(200).json({
        success: true,
        message: 'Payout created successfully',
        paymentId,
        userUid,
        username: user.username,
        amount: payoutAmount,
        memo: paymentData.memo,
        status: 'created',
        piNetworkResponse: piResponse.data
      });

    } catch (piError) {
      console.error('❌ Pi Network A2U payment error:', {
        message: piError.message,
        response: piError.response?.data,
        status: piError.response?.status,
        headers: piError.response?.headers,
        stack: piError.stack,
        userUid,
        amount: payoutAmount
      });

      // Handle different types of errors
      if (piError.code === 'ECONNABORTED') {
        return res.status(408).json({ 
          error: 'Pi Network API timeout',
          details: {
            type: 'timeout',
            message: 'The Pi Network API took too long to respond. Please try again later.'
          }
        });
      }

      if (piError.code === 'ENOTFOUND' || piError.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'Pi Network API unavailable',
          details: {
            type: 'network_error',
            message: 'Unable to connect to Pi Network API. Please try again later.'
          }
        });
      }

      // Check if it's an API error with a response
      if (piError.response) {
        const status = piError.response.status;
        const errorData = piError.response.data;
        const errorMessage = errorData?.message || errorData?.error || piError.message;

        if (status === 401 || status === 403) {
          return res.status(status).json({ 
            error: 'Invalid Pi Network API credentials',
            details: {
              type: 'auth_error',
              message: errorMessage
            }
          });
        } else if (status === 404) {
          return res.status(404).json({ 
            error: 'User not found on Pi Network',
            details: {
              type: 'user_not_found',
              userUid,
              message: errorMessage
            }
          });
        } else if (status === 400) {
          return res.status(400).json({ 
            error: 'Pi Network API error',
            details: {
              type: 'bad_request',
              message: errorMessage,
              userUid
            }
          });
        } else if (status >= 500) {
          return res.status(502).json({ 
            error: 'Pi Network API server error',
            details: {
              type: 'server_error',
              status,
              message: errorMessage
            }
          });
        }
      }

      // For any other error, throw it to be caught by the outer handler
      throw new Error(`Pi Network A2U payment error: ${piError.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ A2U payout error (outer handler):', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
      userUid: req.body?.userUid,
      amount: req.body?.amount,
      name: error.name,
      code: error.code,
      type: typeof error,
      constructor: error.constructor?.name
    });
    
    // Return a more specific error message
    let errorMessage = 'Payout creation failed';
    let statusCode = 500;
    
    if (error.message) {
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = error.message;
      } else if (error.message.includes('timeout')) {
        statusCode = 408;
        errorMessage = 'Request timeout - please try again';
      } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        statusCode = 503;
        errorMessage = 'Network error - please try again later';
      } else if (error.message.includes('Pi Network A2U payment error')) {
        statusCode = 502;
        errorMessage = error.message;
      } else {
        errorMessage = error.message;
      }
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        stack: error.stack,
        type: error.constructor?.name,
        userUid: req.body?.userUid,
        amount: req.body?.amount
      } : undefined
    });
  }
}
