import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error("❌ MONGO_DB_URL not set in .env.local");
  process.exit(1);
}

// Define schema directly for standalone script
const piCashCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  prizePool: { type: Number, required: true },
  weekStart: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  drawAt: { type: Date, required: true },
  claimExpiresAt: { type: Date, required: true },
}, { timestamps: true });

const PiCashCode = mongoose.models.PiCashCode || mongoose.model('PiCashCode', piCashCodeSchema);

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('⚠ Clearing previous Pi Cash Codes...');
    await PiCashCode.deleteMany({});

    console.log('🚀 Inserting new Pi Cash Code...');
    await PiCashCode.create({
      code: 'WIN-314X',
      prizePool: 14250,
      weekStart: new Date('2025-06-10T15:14:00Z'),
      expiresAt: new Date('2025-06-11T22:18:00Z'),
      drawAt: new Date('2025-06-13T15:14:00Z'),
      claimExpiresAt: new Date('2025-06-13T15:45:04Z'),
    });

    console.log('✅ Pi Cash Code seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seed();
