// scripts/seedCompetition.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


import Competition from '../models/Competition.js';

const MONGO_URI = process.env.MONGODB_URI || 'your-mongodb-connection-string';

const playstation5Competition = {
  slug: 'ps5-bundle-giveaway',
  title: 'PlayStation 5 Giveaway',
  prize: 'PlayStation 5 + Extra Controller',
  entryFee: 0.25,
  imageUrl: '/images/playstation.jpeg',
  date: 'June 14, 2025',
  time: '3:14 PM UTC',
  location: 'Online',
  endsAt: new Date('2025-06-14T15:14:00Z'),
  totalTickets: 2000,
};

async function seed() {
  try {
    console.log('Connecting to MongoDB with URI:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Competition.findOneAndUpdate(
      { slug: playstation5Competition.slug },
      playstation5Competition,
      { upsert: true, new: true }
    );

    console.log('Seeded Competition:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
