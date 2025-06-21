import { MongoClient } from 'mongodb';
import axios from 'axios';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, txid, slug } = req.body;

  if (!paymentId || !txid || !slug) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Get database connection
    const { db } = await connectToDatabase();

    // First check if payment is already completed in our database
    const existingPayment = await db.collection('payments').findOne({ paymentId });
    if (existingPayment?.status === 'completed') {
      console.log('✅ Payment already completed:', paymentId);
      return res.status(200).json({
        message: 'Payment was already completed',
        ticketNumber: existingPayment.ticketNumber,
        competitionStatus: existingPayment.competitionStatus
      });
    }

    // Get competition by slug first to fail fast if not found
    const competition = await db.collection('competitions').findOne(
      { 'comp.slug': slug }
    );

    if (!competition) {
      console.error('❌ Competition not found:', slug);
      return res.status(404).json({ error: 'Competition not found' });
    }

    console.log('🔄 Completing payment with Pi Network:', paymentId);
    console.log('📝 Using API URL:', PI_API_URL);

    try {
      // Check payment status with Pi Network first
      const statusResponse = await axios.get(
        `${PI_API_URL}/${paymentId}`,
        {
          headers: { 
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const paymentStatus = statusResponse.data;
      console.log('📝 Payment status:', paymentStatus);

      // If payment is already completed with Pi Network, just update our records
      if (paymentStatus.status?.developer_completed) {
        console.log('✅ Payment already completed with Pi Network:', paymentId);
      } else {
        // If transaction is verified but not completed, we can proceed
        if (paymentStatus.status?.transaction_verified && paymentStatus.transaction?.verified) {
          console.log('🔄 Transaction verified, proceeding with completion:', paymentId);
          try {
            // Complete payment with Pi Network
            const piResponse = await axios.post(
              `${PI_API_URL}/${paymentId}/complete`,
              { txid },
              {
                headers: { 
                  'Authorization': `Key ${PI_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            console.log('📝 Pi Network completion response:', piResponse.data);

            if (!piResponse.data?.ok) {
              console.warn('⚠️ Pi Network completion failed but transaction is verified');
            }
          } catch (completeError) {
            console.warn('⚠️ Error completing with Pi Network but transaction is verified:', completeError);
            // Don't throw here - we'll continue processing since transaction is verified
          }
        } else {
          throw new Error('Transaction not verified');
        }
      }

      // Use a transaction to update both payment and competition atomically
      const session = cachedClient.startSession();
      let ticketNumber;
      let competitionStatus;

      try {
        await session.withTransaction(async () => {
          // First check if we've already processed this payment
          const existingPayment = await db.collection('payments').findOne(
            { paymentId, status: 'completed' },
            { session }
          );

          if (existingPayment) {
            console.log('✅ Payment already processed:', paymentId);
            ticketNumber = existingPayment.ticketNumber;
            competitionStatus = existingPayment.competitionStatus;
            return;
          }

          // Get current competition state
          const currentCompetition = await db.collection('competitions').findOne(
            { 'comp.slug': slug },
            { session }
          );

          if (!currentCompetition) {
            console.error('❌ Competition not found during update:', slug);
            throw new Error(`Competition ${slug} not found during update`);
          }

          console.log('📝 Current competition state:', {
            slug,
            ticketsSold: currentCompetition.comp.ticketsSold,
            totalTickets: currentCompetition.comp.totalTickets,
            status: currentCompetition.comp.status
          });

          // Update competition ticket count
          const result = await db.collection('competitions').findOneAndUpdate(
            { 
              'comp.slug': slug,
              'comp.status': 'active',  // Only update if competition is still active
              'comp.ticketsSold': { $lt: currentCompetition.comp.totalTickets }  // Only update if not full
            },
            {
              $inc: { 'comp.ticketsSold': 1 }
            },
            { 
              returnDocument: 'after',
              session 
            }
          );

          if (!result.value) {
            console.error('❌ Failed to update competition:', {
              slug,
              currentState: currentCompetition,
              paymentId
            });
            throw new Error('Competition is no longer available for entry');
          }

          ticketNumber = result.value.comp.ticketsSold;
          competitionStatus = result.value.comp.status;

          // Check if competition is now full
          if (result.value.comp.ticketsSold >= result.value.comp.totalTickets) {
            console.log('📝 Competition is now full:', slug);
            await db.collection('competitions').updateOne(
              { 'comp.slug': slug },
              { $set: { 'comp.status': 'completed' } },
              { session }
            );
            competitionStatus = 'completed';
          }

          // Update payment status
          await db.collection('payments').updateOne(
            { paymentId },
            {
              $set: {
                status: 'completed',
                completedAt: new Date(),
                txid,
                competitionSlug: slug,
                ticketNumber,
                competitionStatus,
                // Store the full payment status from Pi Network
                piStatus: paymentStatus.status,
                transaction: paymentStatus.transaction
              }
            },
            { 
              upsert: true,
              session 
            }
          );

          console.log('✅ Successfully updated:', {
            competition: slug,
            ticketNumber,
            status: competitionStatus,
            paymentId
          });
        });

        console.log('✅ Transaction completed successfully');
      } catch (txError) {
        console.error('❌ Transaction error:', {
          message: txError.message,
          stack: txError.stack,
          paymentId,
          slug
        });
        throw txError;
      } finally {
        await session.endSession();
      }

      console.log('✅ Payment completed:', paymentId);
      res.status(200).json({
        message: 'Payment completed',
        ticketNumber,
        competitionStatus
      });
    } catch (piError) {
      console.error('❌ Pi Network API error:', {
        message: piError.message,
        response: piError.response?.data,
        status: piError.response?.status
      });
      throw piError;
    }
  } catch (error) {
    console.error('❌ Payment completion error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message || 'Payment completion failed' 
    });
  }
}
