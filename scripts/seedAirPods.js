import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import Competition from '../src/models/Competition.js';

const airpodsCompetition = {
  slug: 'apple-airpods',
  title: 'Apple AirPods Giveaway',
  prize: 'Apple AirPods',
  entryFee: 0.20,
  imageUrl: '/images/airpods.png',
  date: 'June 4, 2025',
  time: '11:45 AM UTC',
  location: 'Online',
  endsAt: new Date('2025-06-04T11:45:00Z'),
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
      { slug: airpodsCompetition.slug },
      airpodsCompetition,
      { upsert: true, new: true }
    );

    console.log('✅ Apple AirPods Competition Seeded:', result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Apple AirPods:', err);
    process.exit(1);
  }
}

seed();
