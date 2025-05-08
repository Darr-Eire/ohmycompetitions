import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'

export default async function handler(req, res) {
  await dbConnect()
  const threads = await Thread.find().sort({ createdAt: -1 })
  res.status(200).json(threads)
}
