import { getDb } from '@/lib/mongodb'

export default async function handler(req, res) {
  const db = await getDb()

  const unclaimed = await db.collection('pi_cash_codes')
    .find({ winner: { $ne: null }, claimed: false })
    .sort({ weekStart: -1 })
    .toArray()

  const ghosts = unclaimed.map(entry => ({
    weekStart: entry.weekStart,
    code: entry.code,
    prizePool: entry.prizePool,
    rolloverTo: entry.rolloverFrom ? null : true, // Simplified logic
  }))

  res.status(200).json(ghosts)
}
