import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import Competition from '../src/models/Competition.js';

const tvCompetition = {
  slug: '55-inch-tv-giveaway',
  title: '55″ Smart TV Giveaway',
  prize: '55″ 4K Ultra HD Smart TV',
  entryFee: 0.40,
  imageUrl: '/images/tv.jpg',
  date: 'June 20, 2025',
  time: '3:14 PM UTC',
  location: 'Online',
  endsAt: new Date('2025-06-20T15:14:00Z'),
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
      { slug: tvCompetition.slug },
      tvCompetition,
      { upsert: true, new: true }
    );

    console.log('✅ TV Competition Seeded:', result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding TV competition:', err);
    process.exit(1);
  }
}

seed();
