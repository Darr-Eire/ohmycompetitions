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

  const { payment, slug } = req.body;

  if (!payment) {
    return res.status(400).json({ error: 'Missing payment data' });
  }

  try {
    // Get database connection
    const { db } = await connectToDatabase();

    // Check if payment is verified but not completed
    if (payment.status?.developer_approved && 
        payment.status?.transaction_verified && 
        !payment.status?.developer_completed &&
        payment.transaction?.txid) {
      
      console.log('🔄 Found verified but uncompleted payment:', payment.identifier);
      
      try {
        // Complete payment with Pi Network
        const piResponse = await axios.post(
          `${PI_API_URL}/${payment.identifier}/complete`,
          { txid: payment.transaction.txid },
          {
            headers: { 
              'Authorization': `Key ${PI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (piResponse.data?.ok) {
          console.log('✅ Successfully completed verified payment:', payment.identifier);

          // If we have a competition slug, update the competition
          if (slug || payment.metadata?.competitionSlug) {
            const competitionSlug = slug || payment.metadata.competitionSlug;
            
            // Update competition ticket count
            const result = await db.collection('competitions').findOneAndUpdate(
              { 'comp.slug': competitionSlug },
              {
                $inc: { 'comp.ticketsSold': 1 }
              },
              { returnDocument: 'after' }
            );

            if (result.value && result.value.comp.ticketsSold >= result.value.comp.totalTickets) {
              await db.collection('competitions').updateOne(
                { 'comp.slug': competitionSlug },
                { $set: { 'comp.status': 'completed' } }
              );
            }
          }

          // Update payment status
          await db.collection('payments').updateOne(
            { paymentId: payment.identifier },
            {
              $set: {
                status: 'completed',
                completedAt: new Date(),
                txid: payment.transaction.txid,
                competitionSlug: slug || payment.metadata?.competitionSlug
              }
            },
            { upsert: true }
          );

          return res.status(200).json({
            message: 'Verified payment completed',
            paymentId: payment.identifier
          });
        }
      } catch (completeError) {
        console.error('❌ Error completing verified payment:', completeError);
      }
    }

    // If payment wasn't completed or completion failed, record it as incomplete
    const paymentData = {
      status: 'incomplete',
      updatedAt: new Date(),
      payment
    };

    if (slug || payment.metadata?.competitionSlug) {
      paymentData.competitionSlug = slug || payment.metadata.competitionSlug;
    }

    // Update the payment status in the database
    await db.collection('payments').findOneAndUpdate(
      { paymentId: payment.identifier },
      { $set: paymentData },
      { upsert: true }
    );

    // Log the incomplete payment for auditing
    await db.collection('auditLogs').insertOne({
      type: 'INCOMPLETE_PAYMENT',
      paymentId: payment.identifier,
      competitionSlug: slug || payment.metadata?.competitionSlug || null,
      payment,
      createdAt: new Date()
    });

    console.log('✅ Incomplete payment recorded:', payment.identifier);
    res.status(200).json({ 
      message: 'Incomplete payment handled',
      paymentId: payment.identifier
    });

  } catch (error) {
    console.error('❌ Error handling incomplete payment:', error);
    res.status(500).json({ error: 'Failed to handle incomplete payment' });
  }
}
