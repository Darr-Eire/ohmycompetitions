// scripts/seedPiCashCode.js
import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'ohmycompetitions';

function generateCode() {
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${part1}-${part2}`;
}

function getThisMondayUTC() {
  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = monday.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // adjust if Sunday
  monday.setUTCDate(monday.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

function getExpiry(weekStart) {
  const expires = new Date(weekStart);
  expires.setUTCHours(3 + 14, 0, 0); // 3:14 PM UTC Monday
  expires.setTime(expires.getTime() + (31 * 60 * 60 + 4 * 60) * 1000); // +31h 4m
  return expires;
}

async function seed() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('pi_cash_codes');

    const weekStart = getThisMondayUTC();
    const weekKey = weekStart.toISOString().split('T')[0];

    const existing = await col.findOne({ weekStart: weekKey });
    if (existing) {
      console.log(`[ℹ️] Code already exists for ${weekKey}:`, existing.code);
      return;
    }

    const code = generateCode();
    const newDoc = {
      code,
      prizePool: 0,
      weekStart: weekKey,
      expiresAt: getExpiry(weekStart).toISOString(),
      createdAt: new Date().toISOString(),
    };

    await col.insertOne(newDoc);
    console.log(`[✅] New code created for ${weekKey}:`, code);
  } catch (err) {
    console.error('[❌] Error seeding Pi Cash Code:', err);
  } finally {
    await client.close();
  }
}

seed();
