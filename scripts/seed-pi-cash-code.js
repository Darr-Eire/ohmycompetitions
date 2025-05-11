require('dotenv').config({ path: '.env.local' }) // ✅ Load .env.local

const { getDb } = require('../src/lib/mongodb')
const { getPiCashTimes } = require('../src/lib/utils')

async function seedPiCashCode() {
  try {
    const db = await getDb()

    const data = getPiCashTimes()
    data.code = 'SEED-CODE'
    data.prizePool = 10000

    const result = await db.collection('pi_cash_codes').insertOne(data)
    console.log('✅ Seeded Pi Cash Code with ID:', result.insertedId)
  } catch (err) {
    console.error('❌ Failed to seed Pi Cash Code:', err)
  } finally {
    process.exit(0)
  }
}

seedPiCashCode()
