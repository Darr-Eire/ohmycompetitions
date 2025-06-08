// scripts/seedThreads.js
import dotenv from 'dotenv'
dotenv.config()

import { dbConnect } from '../src/lib/dbConnect.js'


const threads = [
  {
    title: 'Welcome to General Discussion',
    body: 'This is the place for all things Pi, prizes, and community.',
    userUid: 'admin_general',
  },
  {
    title: 'What prize should we offer next?',
    body: 'Cast your vote or suggest something new!',
    userUid: 'admin_vote',
  },
  {
    title: 'Have an idea to improve our platform?',
    body: 'Drop your best ideas and we might just build it.',
    userUid: 'admin_ideas',
  },
  {
    title: 'Share your win stories!',
    body: 'Did you win a prize? Show off and inspire others.',
    userUid: 'admin_winners',
  }
]

async function seed() {
  try {
    await dbConnect()
    console.log('✅ Connected to MongoDB')

    await Thread.deleteMany({})
    console.log('🧹 Cleared existing threads')

    await Thread.insertMany(threads)
    console.log(`🌱 Seeded ${threads.length} threads successfully`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error seeding threads:', err)
    process.exit(1)
  }
}

seed()
