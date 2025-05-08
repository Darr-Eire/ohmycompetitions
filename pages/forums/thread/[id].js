// pages/api/forums/thread/[id].js
import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'

export default async function handler(req, res) {
  await dbConnect()
  if (req.method !== 'DELETE') return res.status(405).end()

  const { id } = req.query
  await Thread.findByIdAndDelete(id)
  res.status(200).json({ success: true })
}
