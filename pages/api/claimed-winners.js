import { getDb } from '@/lib/mongodb'

export default async function handler(req, res) {
  const db = await getDb()

  const claimed = await db.collection('pi_cash_codes')
    .find({ claimed: true, winner: { $ne: null } })
    .sort({ weekStart: -1 })
    .toArray()

  const winners = claimed.map(entry => ({
    weekStart: entry.weekStart,
    code: entry.code,
    userId: entry.winner.userId,
    prizePool: entry.prizePool
  }))

  res.status(200).json(winners)
}
