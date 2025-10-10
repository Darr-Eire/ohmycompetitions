import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import Competition from '../src/models/Competition.js';

// Disable strictQuery warning (Mongoose 7+)
mongoose.set('strictQuery', false);

const xboxCompetition = {
  slug: 'xbox-one-bundle-giveaway',
  title: 'Xbox One Bundle Giveaway',
  prize: 'Xbox One + Game Bundle',
  entryFee: 0.30,
  imageUrl: '/images/xbox.jpeg',
  date: 'June 25, 2025',
  time: '3:14 PM UTC',
  location: 'Online',
  endsAt: new Date('2025-06-25T15:14:00Z'),
  totalTickets: 1800,
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
      { slug: xboxCompetition.slug },
      xboxCompetition,
      { upsert: true, new: true }
    );

    console.log('✅ Xbox Competition Seeded:', result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Xbox competition:', err);
    process.exit(1);
  }
}

seed();
