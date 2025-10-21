import { dbConnect } from 'lib/dbConnect'
import User from 'models/User'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ found:false, message:'Method not allowed' })
  await dbConnect()
  const q = String(req.query.username || '').trim()
  if (!q) return res.status(400).json({ found:false, message:'Missing username' })
  const user = await User.findOne({
    $or: [{ usernameLower: q.toLowerCase() }, { username: { $regex: new RegExp(`^${q}$`, 'i') } }],
  }).select('username _id')
  return res.status(200).json({ found: !!user, user })
}
