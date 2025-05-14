const { connectToDatabase } = require('../lib/mongodb');
const { ObjectId } = require('mongodb');

async function main() {
  try {
    const { db } = await connectToDatabase();

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setUTCHours(15, 14, 0, 0); // Monday at 15:14 UTC
    weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay() + 1); // get to Monday

    const code = generateCode();

    const existing = await db.collection('pi_cash_codes').findOne({ weekStart });

    if (existing) {
      console.warn('⚠️ Code for this week already exists:', existing.code);
      return;
    }

    await db.collection('pi_cash_codes').insertOne({
      code,
      weekStart,
      expiresAt: new Date(weekStart.getTime() + 31 * 60 * 60 * 1000 + 4 * 60 * 1000), // 31h 4m
      claimed: false,
      prizePool: 0,
      createdAt: new Date(),
    });

    console.log('✅ New code created:', code);
  } catch (err) {
    console.error('❌ Failed to create Pi Cash Code:', err);
  }
}

function generateCode() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result.match(/.{1,4}/g).join('-');
}

main();
