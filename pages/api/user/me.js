import dbConnect from '@/lib/dbConnect'

import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function handler(req, res) {
  await dbConnect()
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.uid) return res.status(401).json({ error: 'Unauthorized' })

  const user = await User.findOne({ uid: session.user.uid }).select('uid name email')
  res.status(200).json(user)
}
