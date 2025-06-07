import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import Competition from '../src/models/Competition.js'

// Disable strictQuery warning
mongoose.set('strictQuery', false)

const dailyCompetitions = [
  {
    slug: 'daily-jackpot',
    title: 'Daily Jackpot',
    prize: '750 π',
    entryFee: 0.375,
    imageUrl: '/images/jackpot.png',
    endsAt: new Date('2025-06-30T23:59:59Z'),
    totalTickets: 2400,
    ticketsSold: 0,
    comingSoon: true,
  },
  {
    slug: 'everyday-pioneer',
    title: 'Everyday Pioneer',
    prize: '1,000 π',
    entryFee: 0.314,
    imageUrl: '/images/everyday.png',
    endsAt: new Date('2025-06-30T15:14:00Z'),
    totalTickets: 1700,
    ticketsSold: 0,
    comingSoon: true,
  },
  {
    slug: 'daily-pi-slice',
    title: 'Daily Pi Slice',
    prize: '2,000 π',
    entryFee: 0.314,
    imageUrl: '/images/daily.png',
    endsAt: new Date('2025-06-25T15:14:00Z'),
    totalTickets: 3000,
    ticketsSold: 0,
    comingSoon: true,
  },
]

const MONGO_URI = process.env.MONGO_DB_URL

if (!MONGO_URI) {
  console.error('❌ Missing MongoDB connection string.')
  process.exit(1)
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    for (const comp of dailyCompetitions) {
      const result = await Competition.findOneAndUpdate(
        { slug: comp.slug },
        comp,
        { upsert: true, new: true }
      )
      console.log(`✅ Seeded competition: ${comp.title}`)
    }

    process.exit(0)
  } catch (err) {
    console.error('❌ Error seeding data:', err)
    process.exit(1)
  }
}

seed()
