import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end()
  await dbConnect()

  const session = await getServerSession(req, res, authOptions)
  const uid = session?.user?.uid
  if (!uid) return res.status(401).json({ error: 'Unauthorized' })

  const { threadId } = req.body
  if (!threadId) return res.status(400).json({ error: 'Missing threadId' })

  const thread = await Thread.findById(threadId)
  if (!thread) return res.status(404).json({ error: 'Thread not found' })

  const alreadyVoted = thread.upvotes.includes(uid)

  if (alreadyVoted) {
    thread.upvotes = thread.upvotes.filter(id => id !== uid)
  } else {
    thread.upvotes.push(uid)
  }

  await thread.save()

  res.status(200).json({ success: true, upvotes: thread.upvotes.length })
}
