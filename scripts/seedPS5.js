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
  slug: 'ps5-bundle-giveaway',
  title: 'PlayStation 5 Giveaway',
  prize: 'PlayStation 5 + Extra Controller',
  entryFee: 0.40,
  imageUrl: '/images/playstation.jpeg',
  date: 'June 14, 2025',
  time: '3:14 PM UTC',
  location: 'Online',
  endsAt: new Date('2025-06-14T15:14:00Z'),
  totalTickets: 1100,
  ticketsSold: 0,
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
      { slug: ps5Competition.slug },
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
