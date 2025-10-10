const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const ps5Competition = {
  comp: {
    slug: 'ps5-bundle-giveaway',
    entryFee: 0.40,
    totalTickets: 1100,
    ticketsSold: 0,
    startsAt: '2025-06-20T14:00:00Z',
    endsAt: '2025-08-20T14:00:00Z',
    paymentType: 'pi',
    piAmount: 0.40
  },
  title: 'PS5 Bundle',
  prize: 'PlayStation 5',
  href: '/competitions/ps5-bundle-giveaway',
  imageUrl: '/images/playstation.jpeg',
  theme: 'tech'
};

const MONGO_URI = process.env.MONGO_DB_URL;

console.log('🔄 Starting PS5 competition seeding script...');

if (!MONGO_URI) {
  console.error('❌ Missing MongoDB connection string.');
  process.exit(1);
}

console.log('✅ Found MongoDB connection string');

async function seed() {
  let client;
  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();

    console.log('🔄 Upserting PS5 competition...');
    const result = await db.collection('competitions').findOneAndUpdate(
      { 'comp.slug': ps5Competition.comp.slug },
      { $set: ps5Competition },
      { upsert: true, returnDocument: 'after' }
    );

    console.log('✅ PS5 Competition Seeded:', JSON.stringify(result.value || result, null, 2));
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ Disconnected from MongoDB');
    }
    process.exit(0);
  }
}

seed();