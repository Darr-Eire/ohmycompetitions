// scripts/createPiCashCode.js

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'ohmycompetitions';

function generateCode() {
  const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${p1}-${p2}`;
}

function getThisMondayUTC() {
  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = monday.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setUTCDate(monday.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

function getExpiryDate(startDate) {
  const expiry = new Date(startDate);
  expiry.setUTCHours(15, 14, 0); // 3:14 PM UTC
  expiry.setTime(expiry.getTime() + (31 * 60 * 60 + 4 * 60) * 1000); // 31 hours and 4 minutes
  return expiry.toISOString();
}

async function main() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('pi_cash_codes');

    const weekStartDate = getThisMondayUTC();
    const weekKey = weekStartDate.toISOString().split('T')[0];

    const existing = await collection.findOne({ weekStart: weekKey });

    if (existing) {
      console.log(`[ℹ️] Pi code for ${weekKey} already exists:`, existing.code);
      return;
    }

    const newCode = {
      code: generateCode(),
      prizePool: 0,
      weekStart: weekKey,
      expiresAt: getExpiryDate(weekStartDate),
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(newCode);
    console.log(`[✅] New Pi Cash Code seeded for ${weekKey}:`, newCode.code);
  } catch (err) {
    console.error('[❌] Error creating Pi Cash Code:', err);
  } finally {
    await client.close();
  }
}

main();
