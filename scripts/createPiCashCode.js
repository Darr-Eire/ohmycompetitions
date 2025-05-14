require('dotenv').config(); // ✅ Load .env.local
const mongoose = require('mongoose');

// Define your schema/model
const PiCashCode = require('../src/models/PiCashCode');

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('❌ MONGODB_URI is not defined in .env.local');
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('✅ Connected to MongoDB');
}

async function main() {
  await connectToDatabase();

  const today = new Date();
  const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  monday.setUTCHours(15, 14, 0, 0);

  const existing = await PiCashCode.findOne({ weekStart: monday.toISOString() });

  if (existing) {
    console.log(`⚠️ Code for this week already exists: ${existing.code}`);
    return;
  }

  const newCode = new PiCashCode({
    code: generateCode(),
    prizePool: 10000,
    weekStart: monday,
    expiresAt: new Date(monday.getTime() + 31 * 60 * 60 * 1000 + 4 * 60 * 1000),
    drawAt: new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000), // Example: 3 days later
    claimExpiresAt: new Date(monday.getTime() + 31 * 60 * 60 * 1000 + 34 * 60 * 1000),
  });

  await newCode.save();
  console.log(`✅ New Pi Cash Code created: ${newCode.code}`);
  process.exit(0);
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

main().catch((err) => {
  console.error('❌ Error creating Pi Cash Code:', err);
  process.exit(1);
});
