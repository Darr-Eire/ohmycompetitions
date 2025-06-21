const mongoose = require('mongoose');
import { connectToDatabase } from 'lib/mongodb';


// Define schema inline or require it from your models folder
const PiCashCodeSchema = new mongoose.Schema({
  code: String,
  weekStart: Date,
  expiresAt: Date,
  claimed: Boolean,
  prizePool: Number,
  createdAt: Date,
}, { collection: 'pi_cash_codes' });

// Prevent model overwrite error in dev
const PiCashCode = mongoose.models.PiCashCode || mongoose.model('PiCashCode', PiCashCodeSchema, 'picashcodes');


function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let raw = '';
  for (let i = 0; i < 8; i++) {
    raw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return raw.match(/.{1,4}/g).join('-'); // Format like XXXX-XXXX
}

async function main() {
  try {
    await connectToDatabase();

    const now = new Date();
    const weekStart = new Date();
    weekStart.setUTCHours(15, 14, 0, 0); // Monday at 3:14 PM UTC
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 1); // Set to Monday

    const existing = await PiCashCode.findOne({ weekStart });

    if (existing) {
      console.warn('⚠️ Code for this week already exists:', existing.code);
      return;
    }

    const newCode = generateCode();
    const expiresAt = new Date(weekStart.getTime() + (31 * 60 + 4) * 60 * 1000); // +31h 4m

    await PiCashCode.create({
      code: newCode,
      weekStart,
      expiresAt,
      claimed: false,
      prizePool: 0,
      createdAt: new Date()
    });

    console.log('✅ New code created:', newCode);
  } catch (err) {
    console.error('❌ Failed to create Pi Cash Code:', err);
  }
}

main();
