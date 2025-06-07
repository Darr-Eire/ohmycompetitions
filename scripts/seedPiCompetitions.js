import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Competition from '../src/models/Competition.js';

// Disable strictQuery warning for Mongoose 7+
mongoose.set('strictQuery', false);

const piCompetitions = [
  {
    slug: 'pi-giveaway-10k',
    title: '10,000 Pi Giveaway',
    prize: '10,000 π',
    entryFee: 2.2,
    date: 'June 28, 2025',
    time: '12:00 AM UTC',
    endsAt: new Date('2025-06-30T00:00:00Z'),
    location: 'Online',
    totalTickets: 5200,
    ticketsSold: 0,
  },
  {
    slug: 'pi-giveaway-5k',
    title: '5,000 Pi Giveaway',
    prize: '5,000 π',
    entryFee: 1.8,
    date: 'June 29, 2025',
    time: '12:00 AM UTC',
    endsAt: new Date('2025-06-30T00:00:00Z'),
    location: 'Online',
    totalTickets: 2900,
    ticketsSold: 0,
  },
  {
    slug: 'pi-giveaway-2.5k',
    title: '2,500 Pi Giveaway',
    prize: '2,500 π',
    entryFee: 1.6,
    date: 'June 28, 2025',
    time: '12:00 AM UTC',
    endsAt: new Date('2025-06-29T00:00:00Z'),
    location: 'Online',
    totalTickets: 1600,
    ticketsSold: 0,
  },
];

const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error('❌ Missing MongoDB connection string.');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const comp of piCompetitions) {
      const result = await Competition.findOneAndUpdate(
        { slug: comp.slug },
        comp,
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded: ${comp.title}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Pi competitions:', err);
    process.exit(1);
  }
}

seed();
