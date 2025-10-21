// src/pages/api/user/lookup.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from 'lib/dbConnect'
import User from 'models/User'

type PublicUser = { _id: string; username: string }
type NotFound = { found: false; message: string }
type Found = { found: true; user: PublicUser }
type Data = NotFound | Found

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ found: false, message: 'Method not allowed' })
  }

  await dbConnect()

  const q = String(req.query.username || '').trim()
  if (!q) {
    return res.status(400).json({ found: false, message: 'Missing username' })
  }

  const doc = await User.findOne({
    $or: [
      { usernameLower: q.toLowerCase() },
      { username: { $regex: new RegExp(`^${q}$`, 'i') } },
    ],
  })
    .select('username _id')
    .lean()

  if (!doc) {
    return res.status(200).json({ found: false, message: 'User not found' })
  }

  const user: PublicUser = { _id: String(doc._id), username: doc.username }
  return res.status(200).json({ found: true, user })
}
