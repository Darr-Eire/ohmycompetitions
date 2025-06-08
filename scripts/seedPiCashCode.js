// src/scripts/seedPiCashCode.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


// Load env vars
dotenv.config();

// Define schema directly here for standalone script
const piCashCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  prizePool: { type: Number, required: true },
  weekStart: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  drawAt: { type: Date, required: true },
  claimExpiresAt: { type: Date, required: true },
}, { timestamps: true });

const PiCashCode = mongoose.models.PiCashCode || mongoose.model('PiCashCode', piCashCodeSchema);

// Get Mongo URI from your env file (make sure it's correct)
const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error("❌ MONGO_DB_URL not set in .env.local");
  process.exit(1);
}

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Optional: Clear previous data
    await PiCashCode.deleteMany({});

    // Insert data
    await PiCashCode.create({
      code: 'WIN-314X',
      prizePool: 14250,
      weekStart: new Date('2025-06-10T15:14:00Z'),
      expiresAt: new Date('2025-06-11T22:18:00Z'),
      drawAt: new Date('2025-06-13T15:14:00Z'),
      claimExpiresAt: new Date('2025-06-13T15:45:04Z'),
    });

    console.log('✅ Real Pi Cash Code seeded.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seed();
