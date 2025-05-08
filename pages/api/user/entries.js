import dbConnect from '@/lib/dbConnect'

import Entry from '@/models/Entry'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function handler(req, res) {
  await dbConnect()
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.uid) return res.status(401).json({ error: 'Unauthorized' })

  const entries = await Entry.find({ userUid: session.user.uid })
    .sort({ createdAt: -1 })
    .select('competitionName competitionId quantity status createdAt')

  res.status(200).json(entries)
}
