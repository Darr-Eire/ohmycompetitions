import { MongoClient } from 'mongodb';
import axios from 'axios';
import initCORS from '../../../lib/cors';

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGO_DB_URL;
const PI_API_KEY = process.env.PI_API_KEY;
const PI_API_URL = process.env.NODE_ENV === 'development' 
  ? 'https://api.minepi.com/v2/payments' 
  : 'https://api.minepi.com/v2/payments';

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
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

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

    const { payment, slug } = req.body;

    console.log('🔄 Handling incomplete payment:', {
      payment,
      slug
    });

    if (!payment || !payment.identifier) {
      return res.status(400).json({ error: 'Missing payment data' });
    }

    // Get database connection
    const { client, db } = await connectToDatabase();

    try {
      // Check payment status with Pi Network
      console.log('🔄 Checking Pi Network status for incomplete payment:', payment.identifier);
      const statusResponse = await axios.get(
        `${PI_API_URL}/${payment.identifier}`,
        {
          headers: { 
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const paymentStatus = statusResponse.data;
      console.log('📝 Pi Network payment status:', {
        paymentId: payment.identifier,
        status: paymentStatus.status,
        transaction: paymentStatus.transaction
      });

      // Log the incomplete payment for record keeping
      await db.collection('incomplete_payments').updateOne(
        { paymentId: payment.identifier },
        {
          $set: {
            paymentId: payment.identifier,
            slug: slug,
            payment: payment,
            piStatus: paymentStatus.status,
            checkedAt: new Date(),
            loggedAt: new Date()
          }
        },
        { upsert: true }
      );

      // If the payment is actually completed, try to process it
      if (paymentStatus.status?.transaction_verified && paymentStatus.transaction?.verified) {
        console.log('🔄 Incomplete payment is actually verified, attempting to complete it');
        // Try to complete this payment
        try {
          const completeResponse = await fetch(`${req.headers.origin}/api/pi/complete-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              paymentId: payment.identifier,
              txid: paymentStatus.transaction.txid,
              slug: slug || payment.metadata?.slug || payment.metadata?.competitionSlug || 'match-pi-retry',
              amount: payment.amount || 1
            })
          });

          if (completeResponse.ok) {
            const result = await completeResponse.json();
            console.log('✅ Successfully completed incomplete payment:', result);
            return res.status(200).json({ 
              message: 'Incomplete payment completed successfully',
              result
            });
          }
        } catch (completeError) {
          console.warn('⚠️ Could not complete incomplete payment:', completeError);
        }
      }

      // If we can't complete it, instruct the user to cancel it from their Pi wallet
      if (!paymentStatus.transaction || !paymentStatus.transaction.txid) {
        return res.status(400).json({
          error: 'pending_payment',
          message: 'You have a pending payment that cannot be completed automatically. Please open your Pi wallet and cancel the payment, then try again.'
        });
      }

      res.status(200).json({ 
        message: 'Incomplete payment handled',
        paymentId: payment.identifier
      });

    } catch (piError) {
      console.error('❌ Error checking Pi Network status:', piError);
      
      // Log the incomplete payment anyway
      await db.collection('incomplete_payments').updateOne(
        { paymentId: payment.identifier },
        {
          $set: {
            paymentId: payment.identifier,
            slug: slug,
            payment: payment,
            error: piError.message,
            loggedAt: new Date()
          }
        },
        { upsert: true }
      );

      res.status(200).json({ 
        message: 'Incomplete payment logged',
        paymentId: payment.identifier
      });
    }

  } catch (error) {
    console.error('❌ Incomplete payment handler error:', error);
    res.status(500).json({ 
      error: 'Failed to handle incomplete payment',
      details: error.message 
    });
  }
}
