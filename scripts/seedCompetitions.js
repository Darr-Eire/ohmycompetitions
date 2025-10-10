// scripts/seedCompetitions.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_DB_URL;

const competitionSchema = new mongoose.Schema({
  comp: {
    slug: { type: String, required: true, unique: true },
    entryFee: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    startsAt: String,
    endsAt: String,
    location: String
  },
  title: { type: String, required: true },
  prize: { type: String, required: true },
  href: String,
  theme: { type: String, required: true }
});

const Competition = mongoose.models.Competition || mongoose.model('Competition', competitionSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    console.log("🗑 Deleting old competitions...");
    await Competition.deleteMany({});

    console.log("🚀 Seeding competitions...");
    await Competition.create([
      {
        comp: {
          slug: 'ps5-bundle-giveaway',
          entryFee: 0.25,
          totalTickets: 2000,
          ticketsSold: 0,
          startsAt: '2025-06-01T10:00:00Z',
          endsAt: '2025-06-15T10:00:00Z',
          location: 'Online'
        },
        title: 'PlayStation 5 Bundle',
        prize: 'PS5 + Extra Controller',
        href: '/competitions/ps5-bundle-giveaway',
        theme: 'tech'
      },
      {
        comp: {
          slug: '55-inch-tv-giveaway',
          entryFee: 0.40,
          totalTickets: 1500,
          ticketsSold: 0,
          startsAt: '2025-06-02T10:00:00Z',
          endsAt: '2025-06-16T10:00:00Z',
          location: 'Online'
        },
        title: '55" Smart TV',
        prize: '4K UHD Smart TV',
        href: '/competitions/55-inch-tv-giveaway',
        theme: 'tech'
      }
    ]);

    console.log('✅ Competitions seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
