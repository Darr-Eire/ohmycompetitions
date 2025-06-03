import dbConnect from 'lib/dbConnect'

import User from 'models/User'

export default async function handler(req, res) {
  await dbConnect()
  const { uid } = req.query
  if (!uid) return res.status(400).json({ error: 'Missing uid' })

  const user = await User.findOne({ uid }).select('streak lastSpinAt lastGameAt')

  const today = new Date().toISOString().slice(0, 10)
  const hasSpun = user?.lastSpinAt?.toISOString().slice(0, 10) === today
  const hasPlayed = user?.lastGameAt?.toISOString().slice(0, 10) === today

  res.status(200).json({
    streak: user?.streak || 0,
    spinnedToday: hasSpun,
    playedToday: hasPlayed,
  })
}
