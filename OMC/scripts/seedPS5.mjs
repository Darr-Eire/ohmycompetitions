import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import Competition from '../src/models/Competition.js';

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

if (!MONGO_URI) {
  console.error('❌ Missing MongoDB connection string.');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Competition.findOneAndUpdate(
      { 'comp.slug': ps5Competition.comp.slug },
      ps5Competition,
      { upsert: true, new: true }
    );

    console.log('✅ PS5 Competition Seeded:', result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seed();
