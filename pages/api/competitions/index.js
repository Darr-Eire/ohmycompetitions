import dbConnect from '@/lib/mongodb'
import Competition from '@/models/Competition'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method === 'GET') {
    const comps = await Competition.find().sort({ createdAt: -1 })
    return res.status(200).json(comps)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
