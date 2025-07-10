import { MongoClient } from 'mongodb';
import axios from 'axios';
import initCORS from '../../../lib/cors';

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGO_DB_URL;

// Pi Network configuration - use App Secret as API key for App-to-User payments
const PI_APP_ID = process.env.PI_APP_ID;
const PI_APP_SECRET = process.env.PI_APP_SECRET;
const PI_API_KEY = PI_APP_SECRET;
// Use production API URL for both sandbox and production - sandbox is controlled by the SDK
const PI_API_URL = 'https://api.minepi.com/v2/payments';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_DB_URL environment variable inside .env.local'
  );
}

if (!PI_APP_ID || !PI_APP_SECRET) {
  throw new Error(
    'Please define the PI_APP_ID and PI_APP_SECRET environment variables inside .env.local'
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

    const { paymentId, slug, amount } = req.body;

    console.log('🔄 Payment approval request received:', {
      paymentId,
      slug,
      amount,
      body: req.body
    });

    if (!paymentId || !slug || !amount) {
      console.error('❌ Missing required parameters:', { paymentId, slug, amount });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get database connection
    const { db } = await connectToDatabase();

    // First check if payment is already approved in our database
    const existingPayment = await db.collection('payments').findOne({ paymentId });
    if (existingPayment?.status === 'approved' || existingPayment?.status === 'completed') {
      console.log('✅ Payment already approved:', paymentId);
      return res.status(200).json({ message: 'Payment was already approved' });
    }

    // Get competition details by slug
    const competition = await db.collection('competitions').findOne(
      { 'comp.slug': slug }
    );

    if (!competition) {
      console.error('❌ Competition not found:', slug);
      return res.status(404).json({ error: 'Competition not found' });
    }

    console.log('📝 Competition found for payment:', {
      slug,
      title: competition.title,
      status: competition.comp?.status,
      startsAt: competition.comp?.startsAt,
      endsAt: competition.comp?.endsAt,
      entryFee: competition.comp?.entryFee,
      piAmount: competition.comp?.piAmount,
      ticketsSold: competition.comp?.ticketsSold,
      totalTickets: competition.comp?.totalTickets
    });

    // Check if competition is active
    console.log('🔍 Competition status validation enabled with debugging');
    
    if (competition.comp.status !== 'active') {
      console.error('❌ Competition is not active:', {
        slug,
        status: competition.comp.status,
        expectedStatus: 'active'
      });
      // For debugging purposes, let's allow 'pending' and 'draft' status too
      if (!['active', 'pending', 'draft'].includes(competition.comp.status)) {
        return res.status(400).json({ error: 'Competition is not active' });
      } else {
        console.log('🔧 Allowing non-active status for debugging:', competition.comp.status);
      }
    }

    // Check if competition is full
    if (competition.comp.ticketsSold >= competition.comp.totalTickets) {
      console.error('❌ Competition is full:', {
        slug,
        ticketsSold: competition.comp.ticketsSold,
        totalTickets: competition.comp.totalTickets
      });
      return res.status(400).json({ error: 'Competition is full' });
    }

    // Check if competition is active based on dates - make this more lenient
    const now = Date.now();
    const start = new Date(competition.comp.startsAt).getTime();
    const end = new Date(competition.comp.endsAt).getTime();

    console.log('📝 Date validation for payment:', {
      slug,
      currentTime: new Date(now).toISOString(),
      startTime: new Date(start).toISOString(),
      endTime: new Date(end).toISOString(),
      hasStarted: now >= start,
      hasNotEnded: now <= end,
      isWithinDateRange: now >= start && now <= end
    });

    // Check if competition has started
    if (now < start) {
      console.error('❌ Competition has not started:', {
          slug,
          startsAt: competition.comp.startsAt,
          now: new Date(),
        startTime: new Date(start)
        });
        return res.status(400).json({ error: 'Competition has not started yet' });
    }

    // Check if competition has ended (strict enforcement - no grace period)
    if (now > end) {
      console.error('❌ Competition has ended:', {
          slug,
          endsAt: competition.comp.endsAt,
          now: new Date(),
        endTime: new Date(end)
        });
        return res.status(400).json({ error: 'Competition has ended' });
    }

    // Verify the payment amount matches (allow multiple tickets)
    const singleTicketPrice = parseFloat((competition.comp.entryFee || competition.comp.piAmount).toFixed(2));
    const receivedAmount = parseFloat(amount.toFixed(2));
    
    // Calculate how many tickets this payment represents
    const ticketQuantity = Math.round(receivedAmount / singleTicketPrice);
    const expectedAmount = parseFloat((singleTicketPrice * ticketQuantity).toFixed(2));

    // Allow payment if it's a valid multiple of the ticket price (within 0.01 tolerance for floating point)
    const tolerance = 0.01;
    if (Math.abs(expectedAmount - receivedAmount) > tolerance || ticketQuantity < 1 || ticketQuantity > 10) {
      console.error('❌ Payment amount mismatch:', {
        singleTicketPrice,
        receivedAmount,
        ticketQuantity,
        expectedAmount,
        difference: Math.abs(expectedAmount - receivedAmount),
        slug,
        paymentId,
        competition: {
          title: competition.title,
          entryFee: competition.comp.entryFee,
          piAmount: competition.comp.piAmount,
          status: competition.comp.status,
          ticketsSold: competition.comp.ticketsSold,
          totalTickets: competition.comp.totalTickets
        }
      });
      return res.status(400).json({ 
        error: `Payment amount mismatch. Expected multiples of ${singleTicketPrice} π (for 1-10 tickets), Received: ${receivedAmount} π`,
        details: {
          singleTicketPrice,
          receivedAmount,
          ticketQuantity: ticketQuantity > 10 ? 'too many' : ticketQuantity < 1 ? 'too few' : ticketQuantity,
          competition: competition.title
        }
      });
    }

    console.log('✅ Payment amount validated:', {
      singleTicketPrice,
      receivedAmount,
      ticketQuantity,
      competition: competition.title
    });

    try {
      // Check payment status with Pi Network first
      console.log('🔄 Checking payment status with Pi Network:', {
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
      console.log('📝 Payment status from Pi Network:', {
        paymentId,
        status: paymentStatus.status,
        identifier: paymentStatus.identifier,
        user: paymentStatus.user,
        amount: paymentStatus.amount,
        memo: paymentStatus.memo,
        metadata: paymentStatus.metadata
      });

      // If payment is already approved with Pi Network, just update our records
      if (paymentStatus.status?.developer_approved) {
        console.log('✅ Payment already approved with Pi Network:', paymentId);
        
        // Update payment status in database
        await db.collection('payments').updateOne(
          { paymentId },
          {
            $set: {
              status: 'approved',
              competitionSlug: slug,
              amount: receivedAmount,
              updatedAt: new Date(),
              piStatus: paymentStatus.status,
              piUser: paymentStatus.user,
              piMetadata: paymentStatus.metadata
            }
          },
          { upsert: true }
        );

        return res.status(200).json({ 
          message: 'Payment was already approved',
          status: paymentStatus.status,
          amount: receivedAmount,
          alreadyApproved: true
        });
      } else {
        console.log('🔄 Approving payment with Pi Network:', {
          paymentId,
          url: `${PI_API_URL}/${paymentId}/approve`
        });
        
        // Approve payment with Pi Network
        const piResponse = await axios.post(
          `${PI_API_URL}/${paymentId}/approve`,
          {},
          {
            headers: { 
              'Authorization': `Key ${PI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
          }
        );

        console.log('📝 Pi Network approval response:', {
          paymentId,
          response: piResponse.data,
          status: piResponse.status
        });

        // Check if approval was successful by looking at the status
        if (!piResponse.data?.status?.developer_approved) {
          console.error('❌ Pi Network approval failed:', {
            paymentId,
            response: piResponse.data,
            expectedStatus: 'developer_approved: true',
            actualStatus: piResponse.data?.status
          });
          throw new Error('Payment not approved by Pi Network');
        }

        console.log('✅ Payment successfully approved with Pi Network:', {
          paymentId,
          status: piResponse.data.status
        });
      }

      // Update payment status in database
      console.log('🔄 Updating payment status in database:', {
        paymentId,
        status: 'approved',
        slug,
        amount: receivedAmount
      });

      await db.collection('payments').updateOne(
        { paymentId },
        {
          $set: {
            status: 'approved',
            competitionSlug: slug,
            amount: receivedAmount,
            updatedAt: new Date(),
            piStatus: paymentStatus.status,
            piUser: paymentStatus.user,
            piMetadata: paymentStatus.metadata
          }
        },
        { upsert: true }
      );

      console.log('✅ Payment approved:', paymentId);
      res.status(200).json({ 
        message: 'Payment approved',
        status: paymentStatus.status,
        amount: receivedAmount
      });
    } catch (piError) {
      console.error('❌ Pi Network error details:', {
        message: piError.message,
        response: piError.response?.data,
        status: piError.response?.status,
        headers: piError.response?.headers,
        stack: piError.stack,
        paymentId,
        slug,
        isTimeout: piError.code === 'ECONNABORTED',
        code: piError.code,
        errno: piError.errno,
        syscall: piError.syscall
      });

      // Handle different types of errors more specifically
      if (piError.code === 'ECONNABORTED') {
        return res.status(408).json({ 
          error: 'Pi Network API timeout - payment may still be valid',
          details: {
            type: 'timeout',
            message: 'The Pi Network API took too long to respond. The payment may still be valid.'
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

        console.error('❌ Pi Network API error response:', {
          status,
          data: errorData,
          headers: piError.response.headers
        });

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
            error: 'Payment not found on Pi Network',
            details: {
              type: 'not_found',
              paymentId,
              message: errorMessage
            }
          });
        } else if (status === 400) {
          return res.status(400).json({ 
            error: 'Pi Network API error',
            details: {
              type: 'bad_request',
              message: errorMessage,
              paymentId
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
      throw new Error(`Pi Network API error: ${piError.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Payment approval error (outer handler):', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
      paymentId: req.body?.paymentId,
      slug: req.body?.slug,
      name: error.name,
      code: error.code,
      type: typeof error,
      constructor: error.constructor?.name
    });
    
    // Return a more specific error message
    let errorMessage = 'Payment approval failed';
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
      } else if (error.message.includes('Pi Network API error')) {
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
        paymentId: req.body?.paymentId,
        slug: req.body?.slug
      } : undefined
    });
  }
}
