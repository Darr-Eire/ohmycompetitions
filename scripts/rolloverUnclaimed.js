// scripts/rolloverUnclaimed.js
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const GRACE_PERIOD = 31 * 60 * 1000 + 4000; // 31 minutes 4 seconds

async function rolloverUnclaimed() {
  try {
    await client.connect();
    const db = client.db();

    const expiredUnclaimed = await db.collection('pi_cash_codes').find({
      winner: { $exists: true },
      claimedAt: { $exists: false },
      drawAt: { $exists: true },
      $expr: {
        $lt: [
          { $add: [{ $toDate: '$drawAt' }, GRACE_PERIOD] },
          new Date()
        ]
      }
    }).toArray();

    if (expiredUnclaimed.length === 0) {
      console.log('✅ No unclaimed prizes to roll over.');
      return;
    }

    const totalRollover = expiredUnclaimed.reduce((sum, doc) => sum + (doc.prizePool || 0), 0);

    if (totalRollover === 0) {
      console.log('⚠️ No prize pool to roll over.');
      return;
    }

    const currentWeekStart = new Date();
    currentWeekStart.setUTCHours(15, 14, 0, 0);
    currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() - currentWeekStart.getUTCDay()); // last Monday

    const currentCode = await db.collection('pi_cash_codes').findOne({
      weekStart: currentWeekStart.toISOString()
    });

    if (!currentCode) {
      console.log('❌ Current code not found. Seed it first.');
      return;
    }

    await db.collection('pi_cash_codes').updateOne(
      { _id: currentCode._id },
      { $inc: { prizePool: totalRollover } }
    );

    for (const ghost of expiredUnclaimed) {
      await db.collection('ghost_winners').insertOne({
        userId: ghost.winner,
        week: ghost.weekStart,
        missedAt: new Date(),
        prize: ghost.prizePool,
      });
    }

    console.log(`👻 Rolled over ${totalRollover} π to this week's prize pool.`);
  } catch (err) {
    console.error('❌ Rollover failed:', err);
  } finally {
    await client.close();
  }
}

rolloverUnclaimed();
