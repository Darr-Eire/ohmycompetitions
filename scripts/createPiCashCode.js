// scripts/createPiCashCode.js
import { connectToDatabase } from '../src/lib/mongodb.js';
import PiCashCode from '../src/models/PiCashCode.js';

function generateCode() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${segment()}-${segment()}`;
}

function getNextMondayAt314UTC() {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (1 + 7 - day) % 7; // 1 = Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(15, 14, 0, 0); // 3:14 PM UTC
  return monday;
}

function addHoursMinutes(base, hours, minutes) {
  return new Date(base.getTime() + hours * 3600000 + minutes * 60000);
}

async function main() {
  await connectToDatabase();

  const weekStart = getNextMondayAt314UTC();
  const expiresAt = addHoursMinutes(weekStart, 31, 4);
  const drawAt = new Date(weekStart);
  drawAt.setUTCDate(weekStart.getUTCDate() + 4); // Friday
  drawAt.setUTCHours(15, 14, 0, 0);

  const claimExpiresAt = addHoursMinutes(drawAt, 0, 31); // 31 minutes after draw

  const codeAlreadyExists = await PiCashCode.findOne({ weekStart: weekStart.toISOString().slice(0, 10) });
  if (codeAlreadyExists) {
    console.warn(`⚠️ Code for this week already exists: ${codeAlreadyExists.code}`);
    process.exit(0);
  }

  const newCode = await PiCashCode.create({
    code: generateCode(),
    prizePool: 15000,
    weekStart: weekStart.toISOString().slice(0, 10),
    expiresAt,
    drawAt,
    claimExpiresAt,
  });

  console.log('✅ Pi Cash Code created:', newCode.code);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error seeding Pi Cash Code:', err);
  process.exit(1);
});
