import dbConnect from 'lib/dbConnect'
import User from '@models/User'
import GameResult from '@models/GameResult';


import { getServerSession } from 'next-auth'
import { authOptions } from 'lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await dbConnect()

  const session = await getServerSession(req, res, authOptions)
  const uid = session?.user?.uid
  if (!uid) return res.status(401).json({ error: 'Unauthorized' })

  const user = await User.findOne({ uid })
  const today = new Date().toISOString().slice(0, 10)
  const lastPlayed = user?.lastSpinAt?.toISOString().slice(0, 10)

  if (lastPlayed === today) {
    return res.status(400).json({ error: 'You already spun today.' })
  }

  // Example: basic random reward system
  const rewards = [
    { result: '1 Bonus Ticket', prizeAmount: 1 },
    { result: '5 Bonus Tickets', prizeAmount: 5 },
    { result: 'No Win', prizeAmount: 0 },
    { result: '2 Pi', prizeAmount: 2 },
  ]
  const selected = rewards[Math.floor(Math.random() * rewards.length)]

  // Update spin time
  user.lastSpinAt = new Date()
  await user.save()

  // Log result
  await GameResult.create({
    userUid: uid,
    game: 'spin',
    result: selected.result,
    prizeAmount: selected.prizeAmount,
  })

  res.status(200).json({
    success: true,
    message: 'Spin recorded!',
    reward: selected,
  })
}
