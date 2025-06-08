import { dbConnect } from 'lib/dbConnect'
import User from 'models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from 'lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end()
  await dbConnect()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.uid) return res.status(401).json({ error: 'Unauthorized' })

  const { name, email } = req.body
  const updated = await User.findOneAndUpdate(
    { uid: session.user.uid },
    { name, email },
    { new: true }
  ).select('uid name email')

  res.status(200).json({ success: true, user: updated })
}
