// pages/api/user/entries.js

import { dbConnect } from 'lib/dbConnect'
import Entry from 'models/Entry'

import { getServerSession } from 'next-auth'
import { authOptions } from 'lib/auth'

export default async function handler(req, res) {
  try {
    await dbConnect()

    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const entries = await Entry.find({ userUid: session.user.uid })
      .sort({ createdAt: -1 })
      .select('competitionName competitionId quantity status createdAt')

    return res.status(200).json(entries)
  } catch (error) {
    console.error('Error fetching user entries:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}
