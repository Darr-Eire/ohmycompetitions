import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await dbConnect()
  const session = await getServerSession(req, res, authOptions)
  const uid = session?.user?.uid
  if (!uid) return res.status(401).json({ error: 'Unauthorized' })

  const { title, body, category } = req.body
  if (!title || !category) return res.status(400).json({ error: 'Missing fields' })

  const thread = await Thread.create({ userUid: uid, title, body, category })
  res.status(200).json({ success: true, thread })
}
