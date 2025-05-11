import { getDb } from '../src/lib/mongodb.js'
import { getPiCashTimes } from '../src/lib/utils.js'

async function rollover() {
  const db = await getDb()

  const expired = await db.collection('pi_cash_codes').findOne({
    claimed: false,
    winner: { $ne: null },
    claimExpiresAt: { $lt: new Date() }
  })

  if (!expired) {
    console.log('✅ No unclaimed draws to roll over.')
    return
  }

  const newCode = getPiCashTimes()
  newCode.prizePool = Math.round(expired.prizePool * 1.25)
  newCode.rolloverFrom = expired._id

  const result = await db.collection('pi_cash_codes').insertOne(newCode)

  console.log('🔁 Rolled over unclaimed prize to new code:', newCode.code)
}

rollover().catch(console.error)
