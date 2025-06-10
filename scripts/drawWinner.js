// scripts/drawWinner.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_DB_URL;const client = new MongoClient(uri);

const now = new Date();

async function drawWinner() {
  try {
    await client.connect();
    const db = client.db();

    const activeCode = await db.collection('pi_cash_codes').findOne({
      expiresAt: { $lt: now },
      winner: { $exists: false },
    });

    if (!activeCode) {
      console.log('❌ No eligible code to draw winner from.');
      return;
    }

    const entries = await db.collection('pi_cash_entries')
      .find({ week: activeCode.weekStart.split('T')[0] })
      .toArray();

    if (entries.length === 0) {
      console.log('⚠️ No entries for this week.');
      return;
    }

    const flatEntries = entries.flatMap(entry => Array(entry.quantity).fill(entry.userId));
    const winnerId = flatEntries[Math.floor(Math.random() * flatEntries.length)];

    await db.collection('pi_cash_codes').updateOne(
      { _id: activeCode._id },
      { $set: { winner: winnerId, drawAt: now.toISOString() } }
    );

    console.log(`🏆 Winner drawn: ${winnerId}`);
  } catch (err) {
    console.error('❌ Draw winner failed:', err);
  } finally {
    await client.close();
  }
}

drawWinner();
