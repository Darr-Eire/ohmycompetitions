import { getDb } from '@/lib/mongodb'

export default async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    const code = await db.collection('pi_cash_codes').findOne(
      { expiresAt: { $gt: new Date() } },
      { sort: { weekStart: -1 } }
    )

    if (!code) {
      return res.status(404).json({ error: 'No active code found' })
    }

    return res.status(200).json(code)
  }

  return res.status(405).json({ error: 'Method Not Allowed' })
}
