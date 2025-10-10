// scripts/seedPiCashCode.cjs
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// 1) ENV
const MONGO_URI = process.env.MONGO_DB_URL;
if (!MONGO_URI) {
  console.error('❌ MONGO_DB_URL is missing in .env.local');
  process.exit(1);
}

// 2) Minimal schema (matches your model fields)
const schema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    weekStart: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    drawAt: { type: Date, required: true }, // your schema uses drawAt (API maps to dropAt)
    claimExpiresAt: { type: Date, required: true },
    prizePool: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    claimed: { type: Boolean, default: false },
    winner: {
      uid: String,
      username: String,
      selectedAt: Date,
      claimExpiresAt: Date,
    },
    claimAttempts: [
      {
        uid: String,
        username: String,
        submittedCode: String,
        timestamp: { type: Date, default: Date.now },
        success: Boolean,
      },
    ],
    rolloverFrom: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PiCashCode =
  mongoose.models.PiCashCode || mongoose.model('PiCashCode', schema);

(async function run() {
  try {
    console.log('⏳ Connecting to MongoDB…');
    await mongoose.connect(MONGO_URI); // modern mongoose doesn’t need extra options

    // Build relative times
    const now = new Date();
    const drawAt = new Date(now.getTime() + 2 * 60 * 1000);       // 2 minutes from now
    const expiresAt = new Date(drawAt.getTime() + 30 * 60 * 1000); // 30 minutes after draw
    const claimExpiresAt = new Date(expiresAt.getTime() + 30 * 60 * 1000);

    // Optional: clear old test docs
    // await PiCashCode.deleteMany({});

    const doc = await PiCashCode.create({
      code: '8234-0912',
      weekStart: new Date(new Date().setHours(0, 0, 0, 0)), // start of today
      drawAt,
      expiresAt,
      claimExpiresAt,
      prizePool: 11000,
      ticketsSold: 0,
      claimed: false,
    });

    console.log('✅ Seeded PiCashCode:', {
      _id: doc._id.toString(),
      code: doc.code,
      drawAt: doc.drawAt,
      expiresAt: doc.expiresAt,
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();
