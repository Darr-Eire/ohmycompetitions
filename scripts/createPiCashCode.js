import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure the correct .env file is loaded
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI is missing from .env.local');
  process.exit(1);
}

const client = new MongoClient(uri);

function generateCode() {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${part1}-${part2}`;
}

function getCurrentWeekStart() {
  const now = new Date();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
  monday.setUTCHours(15, 14, 0, 0); // 3:14 PM UTC
  return monday;
}

function getFutureDate(start, offsetHours, offsetMinutes = 0) {
  const ms = (offsetHours * 60 + offsetMinutes) * 60 * 1000;
  return new Date(start.getTime() + ms);
}

async function run() {
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('pi_cash_codes');

    const weekStart = getCurrentWeekStart();
    const existing = await collection.findOne({ weekStart });

    if (existing) {
      console.warn('⚠️ Code for this week already exists:', existing.code);
      return;
    }

    const code = generateCode();
    const prizePool = 10000;

    const newCode = {
      code,
      prizePool,
      weekStart,
      expiresAt: getFutureDate(weekStart, 31, 4),
      drawAt: getFutureDate(weekStart, 96),
      claimExpiresAt: getFutureDate(weekStart, 96, 31),
      createdAt: new Date(),
    };

    await collection.insertOne(newCode);
    console.log('✅ Pi Cash Code created:', newCode);
  } catch (err) {
    console.error('❌ Failed to create Pi Cash Code:', err);
  } finally {
    await client.close();
  }
}

run();
