import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGO_URI = process.env.MONGO_DB_URL

if (!MONGO_URI) {
  console.error("❌ MONGO_DB_URL not set in .env.local")
  process.exit(1)
}

const winnerSchema = new mongoose.Schema({
  claimed: Boolean,
  winner: String,
  claimedAt: Date,
  prize: String,
}, { timestamps: true })

const ClaimedWinner = mongoose.models.ClaimedWinner || mongoose.model('ClaimedWinner', winnerSchema, 'pi_cash_codes') // force collection name

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...')
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log('⚠ Clearing old winner data...')
    await ClaimedWinner.deleteMany({ claimed: true })

    console.log('🚀 Seeding winners...')
    await ClaimedWinner.insertMany([
      {
        claimed: true,
        winner: '@piuser1',
        claimedAt: new Date(),
        prize: 'Mystery Box',
      },
      {
        claimed: true,
        winner: '@piuser2',
        claimedAt: new Date(),
        prize: 'Pi Spin',
      },
      {
        claimed: true,
        winner: '@piuser3',
        claimedAt: new Date(),
        prize: 'Hack the Vault',
      },
    ])

    console.log('✅ Seeded claimed winners successfully.')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error seeding winners:', err)
    process.exit(1)
  }
}

seed()
