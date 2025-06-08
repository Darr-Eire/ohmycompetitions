import mongoose from 'mongoose';

// Define schema directly here for standalone script
const piCashCodeSchema = new mongoose.Schema({
  code: String,
  prizePool: Number,
  weekStart: Date,
  expiresAt: Date,
  drawAt: Date,
  claimExpiresAt: Date,
});

const PiCashCode = mongoose.models.PiCashCode || mongoose.model('PiCashCode', piCashCodeSchema);

// Your live connection string
const MONGO_URI = process.env.MONGO_URI;


async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Optional: Clear previous records to avoid duplicates
    await PiCashCode.deleteMany({});

    // Insert real data
    await PiCashCode.create({
      code: 'WIN-314X',
      prizePool: 14250,
      weekStart: new Date('2025-06-10T15:14:00Z'),
      expiresAt: new Date('2025-06-11T22:18:00Z'),
      drawAt: new Date('2025-06-13T15:14:00Z'),
      claimExpiresAt: new Date('2025-06-13T15:45:04Z')
    });

    console.log('✅ Real Pi Cash Code seeded.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seed();
