import { dbConnect } from 'lib/dbConnect'
import User from 'models/User'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await dbConnect()

  const session = await getServerSession(req, res, authOptions)
  const uid = session?.user?.uid
  if (!uid) return res.status(401).json({ error: 'Unauthorized' })

  const user = await User.findOne({ uid })
  const today = new Date().toISOString().slice(0, 10)
  const lastPlayed = user?.lastVaultAt?.toISOString().slice(0, 10)

  if (lastPlayed === today) {
    return res.status(400).json({ error: 'You already hacked the vault today.' })
  }

  user.lastVaultAt = new Date()
  await user.save()

  res.status(200).json({ success: true, message: 'Vault challenge recorded!' })
}
