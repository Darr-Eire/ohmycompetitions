import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Competition from '../src/models/Competition.js';

// Disable strictQuery warning for Mongoose 7+
mongoose.set('strictQuery', false);

const dailyCompetitions = [
  {
    slug: 'daily-jackpot',
    title: 'Daily Jackpot',
    prize: '750 π',
    entryFee: 0.45,
    date: 'June 30, 2025',
    time: '23:59 UTC',
    endsAt: new Date('2025-06-30T23:59:59Z'),
    location: 'Online',
    totalTickets: 1820,
    ticketsSold: 0,
    comingSoon: true,
  },
  {
    slug: 'everyday-pioneer',
    title: 'Everyday Pioneer',
    prize: '1,000 π',
    entryFee: 0.31,
    date: 'June 30, 2025',
    time: '15:14 UTC',
    endsAt: new Date('2025-06-30T15:14:00Z'),
    location: 'Online',
    totalTickets: 1900,
    ticketsSold: 0,
    comingSoon: true,
  },
  {
    slug: 'daily-pi-slice',
    title: 'Daily Pi Slice',
    prize: '500 π',
    entryFee: 0.37,
    date: 'June 25, 2025',
    time: '15:14 UTC',
    endsAt: new Date('2025-06-25T15:14:00Z'),
    location: 'Online',
    totalTickets: 1500,
    ticketsSold: 0,
    comingSoon: true,
  },
];

const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error('❌ Missing MongoDB connection string. Set MONGO_DB_URL in .env.local');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing daily competitions to avoid duplicates
    const slugs = dailyCompetitions.map(c => c.slug);
    await Competition.deleteMany({ slug: { $in: slugs } });
    console.log('🗑️ Cleared existing daily competitions');

    // Insert new competitions
    for (const comp of dailyCompetitions) {
      const created = await Competition.create(comp);
      console.log(`✅ Inserted: ${created.title} (${created.slug})`);
    }

    console.log('🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
