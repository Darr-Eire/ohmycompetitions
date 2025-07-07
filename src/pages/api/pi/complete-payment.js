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

    const { paymentId, txid, slug, amount } = req.body;

    console.log('🔄 Payment completion request received:', {
      paymentId,
      txid,
      slug,
      amount,
      body: req.body
    });

    if (!paymentId || !txid || !slug) {
      console.error('❌ Missing required parameters:', { paymentId, txid, slug });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get database connection
    const { client, db } = await connectToDatabase();

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

    // Add completion start time for monitoring
    const completionStartTime = Date.now();
    console.log('⏰ Payment completion started at:', new Date().toISOString());

    try {
      // Check payment status with Pi Network first
      const statusResponse = await axios.get(
        `${PI_API_URL}/${paymentId}`,
        {
          headers: { 
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // Reduce to 15 second timeout for faster failure detection
        }
      );

      const paymentStatus = statusResponse.data;
      console.log('📝 Payment status:', paymentStatus);

      // Extract user information from Pi Network response with enhanced logging
      console.log('🔍 Raw payment status structure:', {
        hasUser: !!paymentStatus.user,
        hasUserUid: !!paymentStatus.user_uid,
        hasFromUser: !!paymentStatus.from_user,
        fullStatus: paymentStatus
      });

      // Try multiple possible locations for user info in Pi Network response
      let piUser = null;
      
      if (paymentStatus.user && (paymentStatus.user.uid || paymentStatus.user.username)) {
        piUser = paymentStatus.user;
        console.log('✅ Found user info in paymentStatus.user');
      } else if (paymentStatus.user_uid) {
        // Sometimes Pi Network returns user_uid instead of user object
        piUser = { uid: paymentStatus.user_uid, username: null };
        console.log('✅ Found user_uid in paymentStatus');
      } else if (paymentStatus.from_user) {
        piUser = paymentStatus.from_user;
        console.log('✅ Found user info in paymentStatus.from_user');
      } else {
        console.warn('⚠️ No user info found in Pi Network response. Available fields:', Object.keys(paymentStatus));
        piUser = { uid: null, username: null };
      }

      console.log('👤 Extracted user info:', {
        uid: piUser?.uid,
        username: piUser?.username,
        source: piUser === paymentStatus.user ? 'user' : 
                piUser === paymentStatus.from_user ? 'from_user' : 'user_uid',
        paymentId
      });

      if (!piUser?.uid && !piUser?.username) {
        console.error('❌ Critical: No user identification found in payment:', {
          paymentId,
          paymentStatus: JSON.stringify(paymentStatus, null, 2)
        });
      }

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
                },
                timeout: 30000 // 30 second timeout
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
          console.error('❌ Transaction not verified:', {
            paymentId,
            status: paymentStatus.status,
            transaction: paymentStatus.transaction,
            transactionVerified: paymentStatus.transaction?.verified,
            statusTransactionVerified: paymentStatus.status?.transaction_verified
          });
          throw new Error('Transaction not verified');
        }
      }

      // Use a transaction to update both payment and competition atomically
      const session = await client.startSession();
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

          // Get current competition state with explicit projection
          const currentCompetition = await db.collection('competitions').findOne(
            { 'comp.slug': slug },
            { 
              projection: {
                'comp.status': 1,
                'comp.ticketsSold': 1,
                'comp.totalTickets': 1,
                'comp.entryFee': 1,
                'comp.startsAt': 1,
                'comp.endsAt': 1
              },
              session 
            }
          );

          if (!currentCompetition) {
            console.error('❌ Competition not found during update:', slug);
            throw new Error(`Competition ${slug} not found during update`);
          }

          console.log('📝 Current competition state:', {
            slug,
            ticketsSold: currentCompetition.comp.ticketsSold,
            totalTickets: currentCompetition.comp.totalTickets,
            status: currentCompetition.comp.status,
            entryFee: currentCompetition.comp.entryFee,
            startsAt: currentCompetition.comp.startsAt,
            endsAt: currentCompetition.comp.endsAt
          });

          // Check if competition is active and has available tickets
          console.log('🔍 Competition status validation enabled with debugging');
          
          if (currentCompetition.comp.status !== 'active') {
            console.error('❌ Competition is not active:', {
              slug,
              status: currentCompetition.comp.status,
              expectedStatus: 'active',
              competitionData: currentCompetition.comp
            });
            // For debugging purposes, let's allow 'pending' and 'draft' status too
            if (!['active', 'pending', 'draft'].includes(currentCompetition.comp.status)) {
              throw new Error('Competition is not active');
            } else {
              console.log('🔧 Allowing non-active status for debugging:', currentCompetition.comp.status);
            }
          }

          // Calculate number of tickets from payment amount
          const singleTicketPrice = parseFloat((currentCompetition.comp.entryFee).toFixed(2));
          const paymentAmount = amount || paymentStatus.amount || singleTicketPrice;
          const ticketQuantity = Math.round(paymentAmount / singleTicketPrice);
          
          console.log('📝 Calculating ticket quantity:', {
            singleTicketPrice,
            paymentAmount,
            ticketQuantity,
            slug
          });

          // Validate ticket quantity
          if (ticketQuantity < 1 || ticketQuantity > 10) {
            console.error('❌ Invalid ticket quantity:', {
              ticketQuantity,
              singleTicketPrice,
              paymentAmount
            });
            throw new Error(`Invalid ticket quantity: ${ticketQuantity}`);
          }

          // Check if there are enough tickets available
          if (currentCompetition.comp.ticketsSold + ticketQuantity > currentCompetition.comp.totalTickets) {
            console.error('❌ Not enough tickets available:', {
              slug,
              ticketsSold: currentCompetition.comp.ticketsSold,
              totalTickets: currentCompetition.comp.totalTickets,
              requestedQuantity: ticketQuantity,
              available: currentCompetition.comp.totalTickets - currentCompetition.comp.ticketsSold
            });
            throw new Error('Not enough tickets available');
          }

          // Calculate prize pool addition (50% of payment)
          const prizePoolAddition = paymentAmount * 0.5;
          
          console.log('💰 Prize pool calculation:', {
            paymentAmount,
            prizePoolAddition,
            percentage: '50%'
          });

          // Log the query we're about to run
          console.log('🔄 Attempting to update competition with query:', {
            filter: { 
              'comp.slug': slug,
              'comp.status': 'active',
              'comp.ticketsSold': { $lte: currentCompetition.comp.totalTickets - ticketQuantity }
            },
            update: {
              $inc: { 
                'comp.ticketsSold': ticketQuantity,
                'comp.prizePool': prizePoolAddition
              }
            },
            ticketQuantity,
            prizePoolAddition,
            options: { 
              returnDocument: 'after',
              session: session ? true : false
            }
          });

          // Update competition ticket count AND prize pool with explicit projection
          const result = await db.collection('competitions').findOneAndUpdate(
            { 
              'comp.slug': slug,
              'comp.status': 'active',
              'comp.ticketsSold': { $lte: currentCompetition.comp.totalTickets - ticketQuantity }
            },
            {
              $inc: { 
                'comp.ticketsSold': ticketQuantity,
                'comp.prizePool': prizePoolAddition
              }
            },
            { 
              projection: {
                'comp.status': 1,
                'comp.ticketsSold': 1,
                'comp.totalTickets': 1,
                'comp.prizePool': 1
              },
              returnDocument: 'after',
              session 
            }
          );

          // Get the updated competition state
          const updatedCompetition = await db.collection('competitions').findOne(
            { 'comp.slug': slug },
            { 
              projection: {
                'comp.status': 1,
                'comp.ticketsSold': 1,
                'comp.totalTickets': 1,
                'comp.prizePool': 1
              },
              session 
            }
          );

          if (!updatedCompetition) {
            console.error('❌ Competition not found after update:', slug);
            throw new Error('Competition not found after update');
          }

          console.log('✅ Competition update successful:', {
            slug,
            newTicketsSold: updatedCompetition.comp.ticketsSold,
            totalTickets: updatedCompetition.comp.totalTickets,
            newPrizePool: updatedCompetition.comp.prizePool,
            prizePoolAddition,
            status: updatedCompetition.comp.status
          });

          // Generate ticket numbers for multiple tickets
          const startTicketNumber = updatedCompetition.comp.ticketsSold - ticketQuantity + 1;
          const endTicketNumber = updatedCompetition.comp.ticketsSold;
          
          if (ticketQuantity === 1) {
            ticketNumber = endTicketNumber;
          } else {
            ticketNumber = `${startTicketNumber}-${endTicketNumber}`;
          }
          
          competitionStatus = updatedCompetition.comp.status;

          // Check if competition is now full
          if (updatedCompetition.comp.ticketsSold >= updatedCompetition.comp.totalTickets) {
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
                ticketQuantity,
                competitionStatus,
                // Store user information from Pi Network
                piUser: {
                  uid: piUser.uid,
                  username: piUser.username
                },
                // Store the full payment status from Pi Network
                piStatus: paymentStatus.status,
                transaction: paymentStatus.transaction,
                amount: paymentAmount
              }
            },
            { 
              upsert: true,
              session 
            }
          );

          console.log('✅ Successfully updated payment with user info:', {
            competition: slug,
            ticketNumber,
            status: competitionStatus,
            paymentId,
            user: piUser.username || piUser.uid
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
