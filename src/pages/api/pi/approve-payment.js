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

  const { paymentId, slug, amount } = req.body;

  if (!paymentId || !slug || !amount) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
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

    if (competition.comp?.status !== 'active') {
      return res.status(400).json({ error: 'Competition is not active' });
    }

    // Verify the payment amount matches
    if (competition.comp?.piAmount !== amount) {
      return res.status(400).json({ error: 'Payment amount mismatch' });
    }

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

      // If payment is already approved with Pi Network, just update our records
      if (paymentStatus.status?.developer_approved) {
        console.log('✅ Payment already approved with Pi Network:', paymentId);
      } else {
        console.log('🔄 Approving payment with Pi Network:', paymentId);
        
        // Approve payment with Pi Network
        const piResponse = await axios.post(
          `${PI_API_URL}/${paymentId}/approve`,
          {},
          {
            headers: { 
              'Authorization': `Key ${PI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('📝 Pi Network approval response:', piResponse.data);

        if (!piResponse.data?.ok) {
          throw new Error('Payment not approved by Pi Network');
        }
      }

      // Update payment status in database
      await db.collection('payments').updateOne(
        { paymentId },
        {
          $set: {
            status: 'approved',
            competitionSlug: slug,
            amount,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      console.log('✅ Payment approved:', paymentId);
      res.status(200).json({ message: 'Payment approved' });
    } catch (piError) {
      console.error('❌ Pi Network error details:', {
        message: piError.message,
        response: piError.response?.data,
        status: piError.response?.status,
        headers: piError.response?.headers
      });
      throw new Error(piError.response?.data?.message || 'Payment approval failed');
    }
  } catch (error) {
    console.error('❌ Payment approval error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    res.status(error.response?.status || (error.message.includes('not found') ? 404 : 500))
      .json({ error: error.message });
  }
}
