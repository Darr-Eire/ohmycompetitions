// pages/api/forums/replies.js
import dbConnect from '@/lib/dbConnect'
import Reply from '@/models/Reply'

export default async function handler(req, res) {
  await dbConnect()
  const { threadId } = req.query
  if (!threadId) return res.status(400).json({ error: 'Missing threadId' })

  const replies = await Reply.find({ threadId }).sort({ createdAt: 1 }).lean()
  res.status(200).json(replies)
}
