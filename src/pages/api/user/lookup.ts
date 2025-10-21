// pages/api/user/lookup.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ found:false, message:'Method not allowed' })
  await dbConnect()
  const username = String(req.query.username || '').trim().toLowerCase()
  if (!username) return res.status(400).json({ found:false, message:'Missing username' })
  const user = await User.findOne({ usernameLower: username }).select('username _id')
  return res.status(200).json({ found: !!user, user })
}
