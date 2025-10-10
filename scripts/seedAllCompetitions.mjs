import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import competitions from '../src/data/competitions.js';

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGO_DB_URL;

console.log('🔄 Starting competitions seeding script...');

if (!MONGO_URI) {
  console.error('❌ Missing MongoDB connection string.');
  process.exit(1);
}

console.log('✅ Found MongoDB connection string');

const {
  techItems,
  premiumItems,
  piItems,
  dailyItems,
  freeItems,
  cryptoGiveawaysItems
} = competitions;

// Combine all active competitions (filter out coming soon)
const allCompetitions = [
  ...techItems,
  ...premiumItems,
  ...(piItems || []),
  ...(dailyItems || []),
  ...(freeItems || []),
  ...(cryptoGiveawaysItems || [])
].filter(comp => !comp.comp?.comingSoon);

console.log(`Found ${allCompetitions.length} active competitions to seed`);

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
    const collection = db.collection('competitions');

    // First, let's clear existing competitions
    console.log('🔄 Clearing existing competitions...');
    await collection.deleteMany({});
    console.log('✅ Cleared existing competitions');

    // Now seed each competition
    console.log('🔄 Seeding competitions...');
    for (const competition of allCompetitions) {
      const result = await collection.insertOne(competition);
      console.log(`✅ Seeded competition: ${competition.title} (${competition.comp.slug})`);
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

seed(); 