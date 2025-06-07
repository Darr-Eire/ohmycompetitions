import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import Competition from '../src/models/Competition.js'

// Disable strictQuery warning
mongoose.set('strictQuery', false)

const freeCompetition = {
  slug: 'pi-to-the-moon',
  title: 'Pi To The Moon',
  prize: '10,000 π',
  entryFee: 0,          // Free competition
  imageUrl: '/images/pi-to-the-moon.png',
  endsAt: new Date('2025-05-10T23:59:59Z'),
  totalTickets: 10000,
  ticketsSold: 0,
  comingSoon: false,
  shareBonus: true,      // Enable share bonus
  maxFreeTickets: 2,     // max free tickets per user
}

const MONGO_URI = process.env.MONGO_DB_URL

if (!MONGO_URI) {
  console.error('❌ Missing MongoDB connection string.')
  process.exit(1)
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const result = await Competition.findOneAndUpdate(
      { slug: freeCompetition.slug },
      freeCompetition,
      { upsert: true, new: true }
    )
    console.log(`✅ Seeded free competition: ${freeCompetition.title}`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Error seeding data:', err)
    process.exit(1)
  }
}

seed()
