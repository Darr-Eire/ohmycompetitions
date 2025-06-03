import dbConnect from 'lib/dbConnect'
import GameResult from 'models/GameResult'
import { getServerSession } from 'next-auth'
import { authOptions } from 'lib/auth'

export default async function handler(req, res) {
  await dbConnect()
  const session = await getServerSession(req, res, authOptions)
  const uid = session?.user?.uid
  if (!uid) return res.status(401).json({ error: 'Unauthorized' })

  const history = await GameResult.find({ userUid: uid }).sort({ createdAt: -1 }).lean()
  res.status(200).json(history)
}
