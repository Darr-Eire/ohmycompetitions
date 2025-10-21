// src/pages/api/user/lookup.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from 'lib/dbConnect'
import User from 'models/User'

type Data =
  | { found: false; message: string }
  | { found: true; user: { _id: string; username: string } | null }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET')
    return res.status(405).json({ found: false, message: 'Method not allowed' })

  await dbConnect()

  const q = String(req.query.username || '').trim()
  if (!q) return res.status(400).json({ found: false, message: 'Missing username' })

  const user = await User.findOne({
    $or: [
      { usernameLower: q.toLowerCase() },
      { username: { $regex: new RegExp(`^${q}$`, 'i') } },
    ],
  })
    .select('username _id')
    .lean()

  return res.status(200).json({ found: !!user, user })
}
