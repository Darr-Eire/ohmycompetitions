// scripts/createPiCashCode.js
import { getDb } from '../src/lib/mongodb.js'
import { getPiCashTimes } from '../src/lib/utils.js'

async function main() {
  const db = await getDb()
  const existing = await db.collection('pi_cash_codes').findOne({
    weekStart: getPiCashTimes().weekStart,
  })

  if (existing) {
    console.log('❌ Pi Cash Code for this week already exists.')
    return
  }

  const codeData = getPiCashTimes()
  const result = await db.collection('pi_cash_codes').insertOne(codeData)

  console.log('✅ New Pi Cash Code created with ID:', result.insertedId)
  console.log('🔐 Code:', codeData.code)
}

main().catch(console.error)
