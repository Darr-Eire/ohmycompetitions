// File: /pages/api/thread/upvote.js

import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  await dbConnect()

  const session = await getServerSession(req, res, authOptions)
  const uid = session?.user?.uid
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { threadId } = req.body
  if (!threadId) {
    return res.status(400).json({ error: 'Missing threadId' })
  }

  try {
    const thread = await Thread.findById(threadId)
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' })
    }

    const hasVoted = thread.upvotes.includes(uid)

    if (hasVoted) {
      thread.upvotes = thread.upvotes.filter(id => id !== uid)
    } else {
      thread.upvotes.push(uid)
    }

    await thread.save()

    return res.status(200).json({ success: true, upvotes: thread.upvotes.length })
  } catch (error) {
    console.error('Error updating upvotes:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
