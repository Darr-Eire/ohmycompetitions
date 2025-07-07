import { MongoClient } from 'mongodb';
import axios from 'axios';
import initCORS from '../../../lib/cors';

const MONGODB_URI = process.env.MONGO_DB_URL;
const PI_APP_SECRET = process.env.PI_APP_SECRET;
const PI_API_KEY = PI_APP_SECRET;
const PI_API_URL = 'https://api.minepi.com/v2/payments';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_DB_URL environment variable inside .env.local');
}

if (!PI_API_KEY) {
  throw new Error('Please define the PI_APP_SECRET environment variable inside .env.local');
}

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  try {
    const shouldEndRequest = await initCORS(req, res);
    if (shouldEndRequest) {
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    console.log('🔄 Attempting to recover payment:', paymentId);

    const { client, db } = await connectToDatabase();

    // Check if payment exists in our database
    const existingPayment = await db.collection('payments').findOne({ paymentId });
    
    if (existingPayment?.status === 'completed') {
      console.log('✅ Payment already completed in our database:', paymentId);
      return res.status(200).json({
        success: true,
        message: 'Payment already completed',
        payment: existingPayment
      });
    }

    try {
      // Check payment status with Pi Network
      console.log('🔄 Checking payment status with Pi Network:', paymentId);
      
      const statusResponse = await axios.get(
        `${PI_API_URL}/${paymentId}`,
        {
          headers: { 
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 second timeout for recovery
        }
      );

      const paymentStatus = statusResponse.data;
      console.log('📝 Pi Network payment status:', {
        paymentId,
        status: paymentStatus.status,
        user: paymentStatus.user,
        amount: paymentStatus.amount,
        memo: paymentStatus.memo,
        metadata: paymentStatus.metadata
      });

      // Extract user and competition info
      const piUser = paymentStatus.user || {};
      const metadata = paymentStatus.metadata || {};
      const competitionSlug = metadata.competitionSlug;

      if (!competitionSlug) {
        console.error('❌ No competition slug found in payment metadata');
        return res.status(400).json({ 
          error: 'Cannot recover payment - no competition information found',
          paymentStatus 
        });
      }

      // Check if transaction is verified and payment was submitted to blockchain
      if (paymentStatus.status?.transaction_verified && paymentStatus.transaction?.verified) {
        console.log('✅ Transaction is verified on Pi blockchain, proceeding with recovery');

        // Get competition details
        const competition = await db.collection('competitions').findOne(
          { 'comp.slug': competitionSlug }
        );

        if (!competition) {
          console.error('❌ Competition not found:', competitionSlug);
          return res.status(404).json({ error: 'Competition not found' });
        }

        // Use the completion logic from complete-payment.js
        // Calculate ticket quantity and complete the purchase
        const singleTicketPrice = parseFloat(competition.comp.entryFee.toFixed(2));
        const paymentAmount = paymentStatus.amount || singleTicketPrice;
        const ticketQuantity = Math.round(paymentAmount / singleTicketPrice);
        const prizePoolAddition = paymentAmount * 0.5;

        console.log('🎫 Processing recovery for:', {
          competitionSlug,
          paymentAmount,
          ticketQuantity,
          prizePoolAddition
        });

        // Use transaction to atomically update both payment and competition
        const session = await client.startSession();
        let ticketNumber;
        let competitionStatus;

        try {
          await session.withTransaction(async () => {
            // Check if already processed during this session
            const doubleCheckPayment = await db.collection('payments').findOne(
              { paymentId, status: 'completed' },
              { session }
            );

            if (doubleCheckPayment) {
              console.log('✅ Payment was completed during recovery process');
              ticketNumber = doubleCheckPayment.ticketNumber;
              competitionStatus = doubleCheckPayment.competitionStatus;
              return;
            }

            // Update competition
            const competitionUpdate = await db.collection('competitions').findOneAndUpdate(
              { 
                'comp.slug': competitionSlug,
                'comp.ticketsSold': { $lte: competition.comp.totalTickets - ticketQuantity }
              },
              {
                $inc: { 
                  'comp.ticketsSold': ticketQuantity,
                  'comp.prizePool': prizePoolAddition
                }
              },
              { 
                returnDocument: 'after',
                session,
                projection: { 
                  'comp.ticketsSold': 1, 
                  'comp.status': 1, 
                  'comp.totalTickets': 1 
                }
              }
            );

            if (!competitionUpdate.value) {
              throw new Error('Failed to update competition - may be sold out or inactive');
            }

            ticketNumber = competitionUpdate.value.comp.ticketsSold;
            competitionStatus = competitionUpdate.value.comp.status;

            // Record the payment as completed
            await db.collection('payments').updateOne(
              { paymentId },
              {
                $set: {
                  status: 'completed',
                  completedAt: new Date(),
                  competitionSlug,
                  amount: paymentAmount,
                  ticketNumber,
                  competitionStatus,
                  ticketQuantity,
                  prizePoolAddition,
                  piUser: piUser,
                  piStatus: paymentStatus.status,
                  piMetadata: paymentStatus.metadata,
                  recoveredAt: new Date(),
                  note: 'Payment recovered after timeout'
                }
              },
              { upsert: true, session }
            );

            console.log('✅ Payment recovery completed successfully:', {
              paymentId,
              competitionSlug,
              ticketNumber,
              ticketQuantity,
              userUid: piUser.uid,
              username: piUser.username
            });
          });
        } finally {
          await session.endSession();
        }

        return res.status(200).json({
          success: true,
          message: 'Payment recovered successfully',
          ticketNumber,
          competitionSlug,
          competitionStatus,
          ticketQuantity,
          user: piUser,
          recovered: true
        });

      } else {
        console.log('❌ Transaction not verified on Pi blockchain:', {
          paymentId,
          status: paymentStatus.status,
          transaction: paymentStatus.transaction
        });

        return res.status(400).json({
          error: 'Payment cannot be recovered - transaction not verified on Pi blockchain',
          status: paymentStatus.status,
          paymentId
        });
      }

    } catch (piError) {
      console.error('❌ Pi Network error during recovery:', {
        message: piError.message,
        response: piError.response?.data,
        status: piError.response?.status,
        paymentId
      });

      if (piError.response?.status === 404) {
        return res.status(404).json({ 
          error: 'Payment not found on Pi Network',
          paymentId 
        });
      }

      throw piError;
    }

  } catch (error) {
    console.error('❌ Payment recovery error:', {
      message: error.message,
      stack: error.stack,
      paymentId: req.body.paymentId
    });

    res.status(500).json({
      error: 'Payment recovery failed',
      details: error.message
    });
  }
} 