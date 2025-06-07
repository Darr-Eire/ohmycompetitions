import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import Competition from '../src/models/Competition.js';

const nintendoCompetition = {
  slug: 'nintendo-switch',
  title: 'Nintendo Switch Giveaway',
  prize: 'Nintendo Switch Console',
  entryFee: 0.36,
  imageUrl: '/images/nintendo.png',
  date: 'June 3, 2025',
  time: '1:30 PM UTC',
  location: 'Online',
  endsAt: new Date('2025-06-03T13:30:00Z'),
  totalTickets: 1500,
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
      { slug: nintendoCompetition.slug },
      nintendoCompetition,
      { upsert: true, new: true }
    );

    console.log('✅ Nintendo Switch Competition Seeded:', result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Nintendo Switch:', err);
    process.exit(1);
  }
}

seed();
