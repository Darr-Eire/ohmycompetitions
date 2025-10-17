const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGO_DB_URL;

console.log('🔄 Starting competitions seeding script...');

if (!MONGO_URI) {
  console.error('❌ Missing MongoDB connection string. Check your .env.local file.');
  process.exit(1);
}

console.log('✅ Found MongoDB connection string:', MONGO_URI);

// Define the competitions manually since we can't import ES modules
const competitions = [
  // PS5 Competition
  {
    comp: {
      slug: 'ps5-bundle-giveaway',
      entryFee: 0.40,
      totalTickets: 1100,
      ticketsSold: 0,
      startsAt: '2025-06-20T14:00:00Z',
      endsAt: '2025-08-20T14:00:00Z',
      paymentType: 'pi',
      piAmount: 0.40,
      status: 'active'
    },
    title: 'PS5 Bundle',
    prize: 'PlayStation 5',
    href: '/competitions/ps5-bundle-giveaway',
    imageUrl: '/images/playstation.jpeg',
    theme: 'tech'
  },
  // TV Competition
  {
    comp: {
      slug: '55-inch-tv-giveaway',
      entryFee: 0.45,
      totalTickets: 1500,
      ticketsSold: 0,
      startsAt: '2025-06-16T11:30:00Z',
      endsAt: '2025-08-16T11:30:00Z',
      paymentType: 'pi',
      piAmount: 0.45,
      status: 'active'
    },
    title: '55″ Smart TV',
    prize: '55″ Smart TV',
    href: '/competitions/55-inch-tv-giveaway',
    imageUrl: '/images/tv.jpg',
    theme: 'tech'
  },
  // Xbox Competition
  {
    comp: {
      slug: 'xbox-one-bundle',
      entryFee: 0.35,
      totalTickets: 1300,
      ticketsSold: 0,
      startsAt: '2025-06-12T17:45:00Z',
      endsAt: '2025-08-12T17:45:00Z',
      paymentType: 'pi',
      piAmount: 0.35,
      status: 'active'
    },
    title: 'Xbox One',
    prize: 'Xbox One + Game Pass',
    href: '/competitions/xbox-one-bundle',
    imageUrl: '/images/xbox.jpeg',
    theme: 'tech'
  },
  // Nintendo Switch Competition
  {
    comp: {
      slug: 'nintendo-switch',
      entryFee: 0.36,
      totalTickets: 1830,
      ticketsSold: 0,
      startsAt: '2025-06-09T13:30:00Z',
      endsAt: '2025-08-09T13:30:00Z',
      paymentType: 'pi',
      piAmount: 0.36,
      status: 'active'
    },
    title: 'Nintendo Switch',
    prize: 'Nintendo Switch',
    href: '/competitions/nintendo-switch',
    imageUrl: '/images/nintendo.png',
    theme: 'tech'
  },
  // AirPods Competition
  {
    comp: {
      slug: 'apple-airpods',
      entryFee: 0.30,
      totalTickets: 1665,
      ticketsSold: 0,
      startsAt: '2025-06-12T13:30:00Z',
      endsAt: '2025-08-12T13:30:00Z',
      paymentType: 'pi',
      piAmount: 0.30,
      status: 'active'
    },
    title: 'Apple AirPods',
    prize: 'Apple AirPods',
    href: '/competitions/apple-airpods',
    imageUrl: '/images/airpods.png',
    theme: 'tech'
  },
  // Dubai Holiday Competition
  {
    comp: {
      slug: 'dubai-luxury-holiday',
      entryFee: 2.5,
      totalTickets: 4000,
      ticketsSold: 0,
      startsAt: '2025-06-15T22:00:00Z',
      endsAt: '2025-08-15T22:00:00Z',
      paymentType: 'pi',
      piAmount: 2.5,
      status: 'active'
    },
    title: 'Dubai Luxury Holiday',
    prize: '7-Day Dubai Trip',
    href: '/competitions/dubai-luxury-holiday',
    imageUrl: '/images/dubai-luxury-holiday.jpg',
    theme: 'premium'
  }
];

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
    console.log('✅ Got database instance');

    const collection = db.collection('competitions');
    console.log('✅ Got competitions collection');

    // First, let's clear existing competitions
    console.log('🔄 Clearing existing competitions...');
    const deleteResult = await collection.deleteMany({});
    console.log('✅ Cleared existing competitions:', deleteResult);

    // Now seed each competition
    console.log('🔄 Seeding competitions...');
    for (const competition of competitions) {
      console.log(`🔄 Seeding ${competition.title}...`);
      const result = await collection.insertOne(competition);
      console.log(`✅ Seeded competition: ${competition.title} (${competition.comp.slug})`, result);
    }

    // Verify the seeded data
    const seededCount = await collection.countDocuments();
    console.log(`\n✅ Successfully seeded ${seededCount} competitions`);

    // List all seeded competitions
    console.log('\nSeeded competitions:');
    const seededComps = await collection.find({}).toArray();
    seededComps.forEach(comp => {
      console.log(`- ${comp.title} (${comp.comp.slug})`);
    });

  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ Disconnected from MongoDB');
    }
    process.exit(0);
  }
}

seed().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
}); 