// scripts/createPiCashCode.js
import 'dotenv/config';
import mongoose from 'mongoose';
import PiCashCode from '../src/models/PiCashCode.js';

// Connect to MongoDB
async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('❌ Please define the MONGODB_URI environment variable in .env.local');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

function getCurrentWeekStart() {
  const now = new Date();
  const monday = new Date(now.setUTCHours(15, 14, 0, 0));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return monday.toISOString();
}

function getFutureTime(hours, minutes, seconds = 0) {
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + hours);
  now.setUTCMinutes(now.getUTCMinutes() + minutes);
  now.setUTCSeconds(now.getUTCSeconds() + seconds);
  return now.toISOString();
}

async function main() {
  await connectToDatabase();

  const weekStart = getCurrentWeekStart();
  const existing = await PiCashCode.findOne({ weekStart });

  if (existing) {
    console.log(`⚠️ Code for this week already exists: ${existing.code}`);
    return;
  }

  const newCode = new PiCashCode({
    code: 'SEED-CODE',
    prizePool: 15000,
    weekStart,
    expiresAt: getFutureTime(31, 4),
    drawAt: getFutureTime(4 * 24, 0), // Friday
    claimExpiresAt: getFutureTime(4 * 24, 0, 31 * 60 + 4), // 31m4s after draw
  });

  await newCode.save();
  console.log('✅ New Pi Cash Code seeded successfully:', newCode.code);

  await mongoose.disconnect();
}

main();
