// scripts/drawWinner.js
import { getDb } from '../src/lib/mongodb.js'

async function drawWinner() {
  const db = await getDb()

  // Get current Friday 3:14 PM window
  const now = new Date()
  const thisFriday = new Date(now)
  thisFriday.setUTCDate(now.getUTCDate() + ((5 + 7 - now.getUTCDay()) % 7))
  thisFriday.setUTCHours(15, 14, 0, 0)

  // Find latest unclaimed code
  const code = await db.collection('pi_cash_codes').findOne({
    drawAt: { $lte: thisFriday },
    claimed: false,
    winner: null
  }, { sort: { weekStart: -1 } })

  if (!code) {
    console.log('❌ No eligible code to draw for.')
    return
  }

  const entries = await db.collection('pi_cash_entries').find({
    codeId: code._id
  }).toArray()

  if (entries.length === 0) {
    console.log('⚠️ No entries to draw from. Prize will roll over.')
    return
  }

  const winner = entries[Math.floor(Math.random() * entries.length)]

  await db.collection('pi_cash_codes').updateOne(
    { _id: code._id },
    {
      $set: {
        winner: {
          userId: winner.userId,
          txid: winner.txid,
          selectedAt: new Date()
        }
      }
    }
  )

  console.log(`🎯 Winner selected for ${code.code}:`, winner.userId)
}

drawWinner().catch(console.error)
