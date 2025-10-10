const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const tvCompetition = {
  comp: {
    slug: '55-inch-tv-giveaway',
    entryFee: 0.45,
    totalTickets: 1500,
    ticketsSold: 0,
    startsAt: '2025-06-16T11:30:00Z',
    endsAt: '2025-08-16T11:30:00Z',
    paymentType: 'pi',
    piAmount: 0.45
  },
  title: '55″ Smart TV',
  prize: '55″ Smart TV',
  href: '/competitions/55-inch-tv-giveaway',
  imageUrl: '/images/tv.jpg',
  theme: 'tech'
};

const MONGO_URI = process.env.MONGO_DB_URL;

console.log('🔄 Starting TV competition seeding script...');

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

    console.log('🔄 Upserting TV competition...');
    const result = await db.collection('competitions').findOneAndUpdate(
      { 'comp.slug': tvCompetition.comp.slug },
      { $set: tvCompetition },
      { upsert: true, returnDocument: 'after' }
    );

    console.log('✅ TV Competition Seeded:', JSON.stringify(result.value || result, null, 2));
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
