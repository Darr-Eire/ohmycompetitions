const { connectToDatabase } = require('../src/lib/mongodb');
const { ObjectId } = require('mongodb');

function generatePiCode() {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () => Array.from({ length: 4 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
  return `${segment()}-${segment()}`;
}

async function main() {
  try {
    const db = await connectToDatabase();

    const now = new Date();
    const mondayUTC = new Date(now);
    mondayUTC.setUTCHours(15, 14, 0, 0); // Monday 3:14 PM UTC

    // Always start from most recent Monday
    const day = mondayUTC.getUTCDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    mondayUTC.setUTCDate(mondayUTC.getUTCDate() + diffToMonday);

    const weekStart = mondayUTC.toISOString().slice(0, 10);
    const existing = await db.collection('pi_cash_codes').findOne({ weekStart });

    if (existing) {
      console.log(`⚠️ Code for this week already exists: ${existing.code}`);
      return;
    }

    const code = generatePiCode();
    const expiresAt = new Date(mondayUTC.getTime() + 31 * 60 * 60 * 1000 + 4 * 60 * 1000); // +31h 4m

    const result = await db.collection('pi_cash_codes').insertOne({
      code,
      prizePool: 0,
      weekStart,
      expiresAt,
      claimed: false,
      winner: null,
    });

    console.log('✅ New code created:', code);
  } catch (err) {
    console.error('❌ Failed to create Pi Cash Code:', err);
  } finally {
    process.exit();
  }
}

main();
